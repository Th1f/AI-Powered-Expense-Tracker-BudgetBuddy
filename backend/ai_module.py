import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
import joblib
from datetime import datetime
import json
import re

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

class BudgetBuddyAI:
    def __init__(self):
        self.category_model_path = os.path.join(MODEL_DIR, 'category_prediction_model.joblib')
        self.amount_model_path = os.path.join(MODEL_DIR, 'amount_prediction_model.joblib')
        self.model_loaded = False
        
    def load_models(self):
        """Load trained models if they exist"""
        try:
            if os.path.exists(self.category_model_path):
                self.category_model = joblib.load(self.category_model_path)
                self.model_loaded = True
                return True
            return False
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
            
    def preprocess_transaction_data(self, transactions):
        """Convert transaction data to a dataframe with features for training"""
        if not transactions:
            return None
            
        # Convert to DataFrame
        df = pd.DataFrame(transactions)
        
        # Extract features from description
        df['word_count'] = df['description'].apply(lambda x: len(str(x).split()))
        df['has_number'] = df['description'].apply(lambda x: bool(re.search(r'\d', str(x))))
        
        # Convert datetime strings to datetime objects
        df['date'] = pd.to_datetime(df['date'])
        
        # Extract time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['month'] = df['date'].dt.month
        
        # Text processing for descriptions
        df['description_lower'] = df['description'].str.lower()
        
        return df
        
    def train_category_model(self, transactions):
        """Train a model to predict transaction categories"""
        print("Training category prediction model...")
        
        # Preprocess data
        df = self.preprocess_transaction_data(transactions)
        if df is None or len(df) < 10:
            print("Not enough data to train model")
            return False
            
        # Features and target for category prediction
        X = df[['amount', 'day_of_week', 'day_of_month', 'month', 'word_count', 'has_number']]
        y = df['category']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Create preprocessing pipeline
        numeric_features = ['amount', 'day_of_week', 'day_of_month', 'month', 'word_count', 'has_number']
        numeric_transformer = StandardScaler()
        
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features)
            ])
            
        # Create and train the model
        model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        model.fit(X_train, y_train)
        
        # Save the model
        joblib.dump(model, self.category_model_path)
        
        # Evaluate model
        accuracy = model.score(X_test, y_test)
        print(f"Category prediction model trained with accuracy: {accuracy:.2f}")
        
        self.category_model = model
        self.model_loaded = True
        
        return True
        
    def predict_category(self, transaction_data):
        """Predict category for a new transaction"""
        if not self.model_loaded:
            if not self.load_models():
                return None
                
        # Prepare the data
        # Extract features from the transaction
        features = {
            'amount': float(transaction_data.get('amount', 0)),
            'day_of_week': datetime.strptime(transaction_data.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').weekday(),
            'day_of_month': datetime.strptime(transaction_data.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').day,
            'month': datetime.strptime(transaction_data.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d').month,
            'word_count': len(str(transaction_data.get('description', '')).split()),
            'has_number': bool(re.search(r'\d', str(transaction_data.get('description', ''))))
        }
        
        # Convert to DataFrame for prediction
        df = pd.DataFrame([features])
        
        # Make prediction
        predicted_category = self.category_model.predict(df)[0]
        
        return predicted_category
        
    def process_voice_input(self, text):
        """Process voice input to extract transaction details"""
        # Simple pattern matching for expense information
        amount_pattern = r'(\$?[0-9]+(?:\.[0-9]{2})?)'
        category_keywords = {
            'food': ['food', 'grocery', 'restaurant', 'lunch', 'dinner', 'breakfast', 'meal', 'coffee'],
            'transport': ['transport', 'bus', 'train', 'uber', 'lyft', 'taxi', 'car', 'gas', 'fuel'],
            'entertainment': ['entertainment', 'movie', 'game', 'concert', 'show', 'netflix', 'subscription'],
            'shopping': ['shopping', 'clothes', 'shoes', 'retail', 'amazon', 'purchase'],
            'housing': ['housing', 'rent', 'mortgage', 'utility', 'electric', 'water', 'bill'],
            'health': ['health', 'doctor', 'medical', 'medicine', 'pharmacy', 'drug', 'prescription']
        }
        
        # Extract amount
        amount_match = re.search(amount_pattern, text)
        amount = float(amount_match.group(1).replace('$', '')) if amount_match else None
        
        # Extract category
        text_lower = text.lower()
        detected_category = None
        
        for category, keywords in category_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                detected_category = category
                break
                
        # Extract description
        description = text
        
        return {
            'amount': amount,
            'category': detected_category,
            'description': description,
            'date': datetime.now().strftime('%Y-%m-%d')
        }
        
    def analyze_spending_patterns(self, transactions):
        """Analyze spending patterns to provide insights"""
        if not transactions:
            return []
            
        df = pd.DataFrame(transactions)
        
        # Convert date strings to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Add month column
        df['month'] = df['date'].dt.strftime('%Y-%m')
        
        # Calculate monthly spending by category
        monthly_by_category = df.groupby(['month', 'category'])['amount'].sum().reset_index()
        
        # Find top spending categories
        top_categories = df.groupby('category')['amount'].sum().sort_values(descending=True).head(3)
        
        # Calculate spending trends
        monthly_totals = df.groupby('month')['amount'].sum().reset_index()
        
        # Generate insights
        insights = []
        
        # Top spending categories
        insights.append({
            'type': 'top_categories',
            'text': f"Your top spending category is {top_categories.index[0]} with ${top_categories.iloc[0]:.2f}",
            'data': top_categories.to_dict()
        })
        
        # Spending trend
        if len(monthly_totals) >= 2:
            latest = monthly_totals.iloc[-1]
            previous = monthly_totals.iloc[-2]
            change = (latest['amount'] - previous['amount']) / previous['amount'] * 100
            
            if change > 0:
                insights.append({
                    'type': 'trend',
                    'text': f"Your spending increased by {abs(change):.1f}% compared to last month",
                    'data': {'change': change}
                })
            else:
                insights.append({
                    'type': 'trend',
                    'text': f"Your spending decreased by {abs(change):.1f}% compared to last month",
                    'data': {'change': change}
                })
                
        return insights

# Create singleton instance
budget_ai = BudgetBuddyAI()
