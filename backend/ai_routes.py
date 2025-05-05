from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin
from firebase_admin import firestore
from ai_module import budget_ai
import json

# Create AI Blueprint
ai_bp = Blueprint('ai', __name__)

# Get Firestore database instance
db = firestore.client()

# Authentication decorator (same as in server.py)
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Missing or invalid token', 'error': True}), 401
        
        token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify the token with Firebase Auth
            decoded_token = firebase_admin.auth.verify_id_token(token, check_revoked=False)
            
            # Add user_id to kwargs to be used in the route function
            kwargs['user_id'] = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': f'Invalid token: {str(e)}', 'error': True}), 401
            
    return decorated_function

@ai_bp.route('/train', methods=['POST'])
@token_required
def train_ai_model(user_id):
    """
    Train AI models using the user's transaction data and all anonymized data
    """
    try:
        # Get all transactions from all users for better training
        all_transactions = []
        users_ref = db.collection('users')
        users = users_ref.stream()
        
        for user in users:
            try:
                # Get financial data document for each user
                financial_data = users_ref.document(user.id).collection('finance').document('financial_data').get()
                if financial_data.exists:
                    user_data = financial_data.to_dict()
                    transactions = user_data.get('transactions', [])
                    all_transactions.extend(transactions)
            except Exception as e:
                print(f"Error fetching data for user {user.id}: {e}")
        
        # Train the model
        if len(all_transactions) < 10:
            return jsonify({
                'success': False,
                'message': 'Not enough transaction data for training. Need at least 10 transactions.',
                'error': False
            })
        
        success = budget_ai.train_category_model(all_transactions)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'AI model trained successfully with {len(all_transactions)} transactions',
                'error': False
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Training failed',
                'error': True
            })
            
    except Exception as e:
        return jsonify({
            'message': f'Error training model: {str(e)}',
            'error': True
        }), 500

@ai_bp.route('/predict/category', methods=['POST'])
@token_required
def predict_category(user_id):
    """
    Predict category for a new transaction
    """
    try:
        data = request.get_json()
        transaction = data.get('transaction')
        
        if not transaction:
            return jsonify({
                'message': 'Transaction data is required',
                'error': True
            }), 400
            
        # Load models if needed
        if not budget_ai.model_loaded:
            budget_ai.load_models()
            
        # Predict category
        predicted_category = budget_ai.predict_category(transaction)
        
        if predicted_category:
            return jsonify({
                'category': predicted_category,
                'error': False
            })
        else:
            return jsonify({
                'message': 'Unable to predict category. AI model may need training.',
                'error': True
            }), 400
            
    except Exception as e:
        return jsonify({
            'message': f'Error predicting category: {str(e)}',
            'error': True
        }), 500

@ai_bp.route('/process/voice', methods=['POST'])
@token_required
def process_voice_input(user_id):
    """
    Process voice input and extract transaction details
    """
    try:
        data = request.get_json()
        voice_text = data.get('text')
        
        if not voice_text:
            return jsonify({
                'message': 'Voice text is required',
                'error': True
            }), 400
            
        # Process voice input
        transaction_data = budget_ai.process_voice_input(voice_text)
        
        # If category wasn't detected by keywords, try model prediction
        if not transaction_data['category'] and budget_ai.model_loaded:
            transaction_data['category'] = budget_ai.predict_category(transaction_data)
            
        return jsonify({
            'transaction': transaction_data,
            'error': False
        })
        
    except Exception as e:
        return jsonify({
            'message': f'Error processing voice input: {str(e)}',
            'error': True
        }), 500

@ai_bp.route('/insights', methods=['GET'])
@token_required
def get_spending_insights(user_id):
    """
    Get AI-powered spending insights for the user
    """
    try:
        # Get user's transactions
        financial_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        
        if not financial_data.exists:
            return jsonify({
                'message': 'User financial data not found',
                'error': True
            }), 404
            
        user_data = financial_data.to_dict()
        transactions = user_data.get('transactions', [])
        
        if not transactions:
            return jsonify({
                'message': 'No transaction data available for insights',
                'insights': [],
                'error': False
            })
            
        # Analyze spending patterns
        insights = budget_ai.analyze_spending_patterns(transactions)
        
        return jsonify({
            'insights': insights,
            'error': False
        })
        
    except Exception as e:
        return jsonify({
            'message': f'Error generating insights: {str(e)}',
            'error': True
        }), 500
