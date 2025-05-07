import os
import json
import traceback
from functools import wraps
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
from firebase_admin import firestore


# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Register the AI Blueprin
# Initialize Firebase Admin SDK
# You need to download your Firebase service account key from Firebase Console
# and store it securely in your project
try:
    # First, check if credentials are provided as a JSON string in an environment variable
    firebase_creds_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
    
    if firebase_creds_json:
        # If credentials are provided as a JSON string, parse them
        cred_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(cred_dict)
    else:
        # Otherwise, fall back to file-based credentials
        cred_path = os.environ.get('FIREBASE_CREDENTIALS_PATH', './firebase-credentials.json')
        cred = credentials.Certificate(cred_path)
        
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    # For development, you can continue without Firebase
    # In production, you should handle this error appropriately

# Authentication decorator
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
            # For token time validation issues, we can adjust validation
            # by directly passing options to the verify_id_token function
            options = {
                'verify_expiration': True,  # Still verify token hasn't expired
                'check_revoked': False      # Don't check if token has been revoked
            }
            
            decoded_token = auth.verify_id_token(token, check_revoked=False)
            
            # Add user_id to kwargs to be used in the route function
            kwargs['user_id'] = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': f'Invalid token: {str(e)}', 'error': True}), 401
            
    return decorated_function

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Create a new user in Firebase Auth
    Request body must contain email and password
    """
    print(request)
    data = request.get_json()
    email = data.get('email')
    name = data.get('name', '')
    uid = data.get('uid', '')
    print("Received data:", email, name, uid)
    custom_categories = [
        {
            'id': '1',
            'category': 'Food',
            'allocated': 100,
            'spent': 0,
            'remaining': 100,
            'period': 'monthly',
            'color': '#F97316',
            'icon': 'restaurant'
        },
        {
            'id': '2',
            'category': 'Transport',
            'allocated': 100,
            'spent': 0,
            'remaining': 100,
            'period': 'monthly',
            'color': '#8B5CF6',
            'icon': 'car'
        },
        {
            'id': '3',
            'category': 'Entertainment',
            'allocated': 100,
            'spent': 0,
            'remaining': 100,
            'period': 'monthly',
            'color': '#06B6D4',
            'icon': 'film'
        },
        {
            'id': '4',
            'category': 'Shopping',
            'allocated': 100,
            'spent': 0,
            'remaining': 100,
            'period': 'monthly',
            'color': '#EC4899',
            'icon': 'bag-handle'
        },
        {
            'id': '5',
            'category': 'Housing',
            'allocated': 100,
            'spent': 0,
            'remaining': 100,
            'period': 'monthly',
            'color': '#10B981',
            'icon': 'home'
        },
        {
            'id': '6',
            'category': 'Health',
            'allocated': 100,
            'spent': 0,
            'remaining': 100,
            'period': 'monthly',
            'color': '#EF4444',
            'icon': 'medkit'
        }
    ]
    try:
        db.collection('users').document(uid).set({
            'email': email,
            'name': name
        })
        db.collection('users').document(uid).collection('finance').document('financial_data').set({
            'budget': 1000,
            'used': 0,
            'transactions': [],
            'custom_categories': custom_categories
        })
        print("User created successfully", email, name, uid)
        
        return jsonify({
            'message': 'User created successfully',
            'userId': uid,
            'email': email,
            'name': name,
            'error': False
        }), 201
    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user', methods=['GET'])
@token_required
def get_user(user_id):
    """
    Get user details from Firebase Auth
    Requires a valid Firebase ID token
    """
    try:
        user_data = db.collection('users').document(user_id).get()
        budget_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        if not user_data.exists:
            return jsonify({'message': 'User not found', 'error': True}), 404
        user_info = user_data.to_dict()
        budget_info = budget_data.to_dict()
        return jsonify({
            'userId': user_id,
            'email': user_info.get('email', ''),
            'name': user_info.get('name', ''),
            'budget': budget_info.get('budget', 0),
            'used_budget': budget_info.get('used_budget', 0),
            'transactions': budget_info.get('transactions', []),
            'custom_categories': budget_info.get('custom_categories', []),
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/verify-token', methods=['POST'])
def verify_token():
    """
    Verify a Firebase ID token
    Request body must contain token
    """
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'message': 'Token is required', 'error': True}), 400
        
        # Verify token
        # For Firebase Admin 6.2.0, we use check_revoked=False to be more permissive with token timing
        decoded_token = auth.verify_id_token(token, check_revoked=False)
        
        # Get user from Firebase Auth
        user_id = decoded_token['uid']
        user = auth.get_user(user_id)
        
        return jsonify({
            'userId': user.uid,
            'email': user.email,
            'displayName': user.display_name,
            'emailVerified': user.email_verified,
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 401

@app.route('/api/auth/addexpenses', methods=['POST'])
@token_required
def add_expense(user_id):
    """
    Add a new expense
    Requires a valid Firebase ID token
    """
    try:
        data = request.get_json()
        expense_id = data.get('id')
        expense_title = data.get('title')
        expense_amount = data.get('amount')
        expense_category = data.get('category')
        expense_date = data.get('date')
        expense_isExpense = data.get('isExpense')
        expense_icon = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        expense_icon = expense_icon.to_dict().get('custom_categories', [])
        for category in expense_icon:
            if category['category'].lower() == expense_category.lower():
                expense_icon = category['icon']
                break



        expense = {
            'id': expense_id,
            'title': expense_title,
            'amount': expense_amount,
            'category': expense_category,
            'date': expense_date,
            'isExpense': expense_isExpense,
            'icon': expense_icon
        }
        
        # Get user from Firebase Auth
        user = auth.get_user(user_id)
        
        # Add expense to user's finance data
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'transactions': firestore.ArrayUnion([expense])
        })

        custom_categories = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        custom_categories = custom_categories.to_dict().get('custom_categories', [])
        for category in custom_categories:
            if category['category'].lower() == expense_category.lower():
                category['spent'] += expense_amount
                category['remaining'] -= expense_amount
                break
        
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'custom_categories': custom_categories
        })
        
        
        return jsonify({
            'message': 'Expense added successfully',
            'userId': user_id,
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user/transactions', methods=['GET'])
@token_required
def get_user_transactions(user_id):
    """
    Get user transactions
    Requires a valid Firebase ID token
    """
    try:
        transaction_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        transaction_info = transaction_data.to_dict()
        return jsonify({
            'transactions': transaction_info.get('transactions', []),
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user/addcategory',methods=['POST'])
@token_required
def add_category(user_id):
    """
    Add a new category
    Requires a valid Firebase ID token
    """
    try:
        data = request.get_json()
        category_id = data.get('id')
        category_category = data.get('category')
        category_allocated = data.get('allocated')
        category_spent = data.get('spent')
        category_remaining = data.get('remaining')
        category_period = data.get('period')
        category_color = data.get('color')
        category_icon = data.get('icon')
        
        # Get user from Firebase Auth
        user = auth.get_user(user_id)
        
        # Add category to user's finance data
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'custom_categories': firestore.ArrayUnion([{
                'id': category_id,
                'category': category_category,
                'allocated': category_allocated,
                'spent': category_spent,
                'remaining': category_remaining,
                'period': category_period,
                'color': category_color,
                'icon': category_icon
            }])
        })
        
        return jsonify({
            'message': 'Category added successfully',
            'userId': user_id,
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user/updatecategory', methods=['POST'])
@token_required
def update_category(user_id):
    """
    Update a category
    Requires a valid Firebase ID token
    """
    try:
        data = request.get_json()
        category_id = data.get('id')
        category_category = data.get('category')
        category_allocated = data.get('allocated')
        category_spent = data.get('spent')
        category_remaining = data.get('remaining')
        category_period = data.get('period')
        category_color = data.get('color')
        category_icon = data.get('icon')
        print(data)
        
        # Get user from Firebase Auth
        user = auth.get_user(user_id)
        
        # Update category in user's finance data
        category_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        category_data = category_data.to_dict().get('custom_categories', [])
        for category in category_data:
            if category['id'] == category_id:
                category['category'] = category_category
                category['allocated'] = category_allocated
                category['spent'] = category_spent
                category['remaining'] = category_allocated - category_spent
                category['period'] = category_period
                category['color'] = category_color
                category['icon'] = category_icon
                break
        
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'custom_categories': category_data
        })
        
        return jsonify({
            'message': 'Category updated successfully',
            'userId': user_id,
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user/updatetransaction', methods=['POST'])
@token_required
def update_transaction(user_id):
    """
    Update a transaction
    Requires a valid Firebase ID token
    """
    try:
        data = request.get_json()
        transaction_id = data.get('id')
        transaction_title = data.get('title')
        transaction_amount = data.get('amount')
        transaction_category = data.get('category')
        transaction_date = data.get('date')
        transaction_isExpense = data.get('isExpense')
        transaction_icon = data.get('icon')
        
        # Get user from Firebase Auth
        user = auth.get_user(user_id)
        
        # Update transaction in user's finance data
        transaction_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        transaction_data = transaction_data.to_dict().get('transactions', [])
        for transaction in transaction_data:
            if transaction['id'] == transaction_id:
                temp_category = transaction['category']
                temp_amount = transaction['amount']
                transaction['title'] = transaction_title
                transaction['amount'] = transaction_amount
                transaction['category'] = transaction_category
                transaction['date'] = transaction_date
                transaction['isExpense'] = transaction_isExpense
                transaction['icon'] = transaction_icon
                break
        
        current_category = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        current_category = current_category.to_dict().get('custom_categories', [])
        for category in current_category:
            print(category['category'])
            print(temp_category)
            if category['category'].lower() == temp_category.lower():
                category['spent'] -= temp_amount
                category['remaining'] += temp_amount
                break
       
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'custom_categories': current_category
        })

        custom_categories = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        custom_categories = custom_categories.to_dict().get('custom_categories', [])
        for category in custom_categories:
            if category['category'].lower() == transaction_category.lower():
                category['spent'] += transaction_amount
                category['remaining'] -= transaction_amount
                break
        
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'custom_categories': custom_categories,
            'transactions': transaction_data
        })
        
        return jsonify({
            'message': 'Transaction updated successfully',
            'userId': user_id,
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user/deletetransaction', methods=['POST'])
@token_required
def delete_transaction(user_id):
    """
    Delete a transaction
    Requires a valid Firebase ID token
    """
    try:
        
        data = request.get_json()
        print(data)
        transaction_id = data
        print(transaction_id)
        
        
        # Get user from Firebase Auth
        user = auth.get_user(user_id)
        
        # Delete transaction from user's finance data
        print("0")
        transaction_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        transaction_data = transaction_data.to_dict().get('transactions', [])
        for transaction in transaction_data:
            if transaction['id'] == transaction_id:
                temp  = transaction['amount']
                temp_category = transaction['category']
                transaction_data.remove(transaction)
                break
        category_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        category_data = category_data.to_dict().get('custom_categories', [])
        for category in category_data:
            if category['category'] == temp_category:
                category['spent'] = category['spent'] - temp
                break
        
        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'transactions': transaction_data,
            'custom_categories': category_data,
        })
        
        return jsonify({
            'message': 'Transaction deleted successfully',
            'userId': user_id,
            'error': False
        }), 200
    except Exception as e:
        print(e)
        return jsonify({'message': str(e), 'error': True}), 400

@app.route('/api/auth/user/deletecategory', methods=['POST'])
@token_required
def delete_category(user_id):
    """
    Delete a category
    Requires a valid Firebase ID token
    """
    try:
        data = request.get_json()
        category_id = data.get('id')
        
        # Get user from Firebase Auth
        user = auth.get_user(user_id)
        
        # Delete category from user's finance data
        category_data = db.collection('users').document(user_id).collection('finance').document('financial_data').get()
        category_data = category_data.to_dict().get('custom_categories', [])
        for category in category_data:
            if category['id'] == category_id:
                category_data.remove(category)
                break

        db.collection('users').document(user_id).collection('finance').document('financial_data').update({
            'custom_categories': category_data
        })
        
        return jsonify({
            'message': 'Category deleted successfully',
            'userId': user_id,
            'error': False
        }), 200
    except Exception as e:
        return jsonify({'message': str(e), 'error': True}), 400

# Protected route example
@app.route('/api/protected', methods=['GET'])
@token_required
def protected_route(user_id):
    """
    Example of a protected route
    Requires a valid Firebase ID token
    """
    return jsonify({
        'message': 'This is a protected route',
        'userId': user_id,
        'error': False
    }), 200


# Health check route
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check route to verify the server is running
    """
    return jsonify({
        'status': 'healthy',
        'error': False
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=True)