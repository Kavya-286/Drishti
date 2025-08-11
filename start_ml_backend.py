#!/usr/bin/env python3
"""
Startup script for the ML backend server.
This ensures all dependencies are available and starts the Flask server.
"""

import os
import sys
import subprocess
import importlib.util

def check_and_install_package(package_name, import_name=None):
    """Check if a package is installed, install if missing"""
    if import_name is None:
        import_name = package_name
    
    try:
        importlib.import_module(import_name)
        print(f"✓ {package_name} is installed")
        return True
    except ImportError:
        print(f"✗ {package_name} not found, installing...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
            print(f"✓ {package_name} installed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to install {package_name}: {e}")
            return False

def download_nltk_data():
    """Download required NLTK data"""
    try:
        import nltk
        
        # Check if punkt tokenizer is available
        try:
            nltk.data.find('tokenizers/punkt')
            print("✓ NLTK punkt tokenizer is available")
        except LookupError:
            print("⬇ Downloading NLTK punkt tokenizer...")
            nltk.download('punkt')
            
        # Check if stopwords are available
        try:
            nltk.data.find('corpora/stopwords')
            print("✓ NLTK stopwords are available")
        except LookupError:
            print("⬇ Downloading NLTK stopwords...")
            nltk.download('stopwords')
            
        return True
    except Exception as e:
        print(f"✗ Error setting up NLTK data: {e}")
        return False

def main():
    """Main startup function"""
    print("🚀 Starting StartupValidator ML Backend...")
    print("=" * 50)
    
    # Required packages
    packages = [
        ("flask", "flask"),
        ("flask-cors", "flask_cors"),
        ("pandas", "pandas"),
        ("numpy", "numpy"),
        ("scikit-learn", "sklearn"),
        ("nltk", "nltk"),
        ("textblob", "textblob")
    ]
    
    # Check and install packages
    print("📦 Checking Python dependencies...")
    all_packages_ok = True
    for package, import_name in packages:
        if not check_and_install_package(package, import_name):
            all_packages_ok = False
    
    if not all_packages_ok:
        print("✗ Some packages failed to install. Please install them manually:")
        print("pip install flask flask-cors pandas numpy scikit-learn nltk textblob")
        sys.exit(1)
    
    # Download NLTK data
    print("\n📊 Setting up NLTK data...")
    if not download_nltk_data():
        print("⚠ NLTK data setup failed, but continuing anyway...")
    
    # Import and start the Flask app
    print("\n🔧 Loading ML validation engine...")
    try:
        # Change to server directory
        server_dir = os.path.join(os.path.dirname(__file__), 'server')
        os.chdir(server_dir)
        
        # Import the Flask app
        from app import app
        
        print("✓ ML validation engine loaded successfully")
        print("\n🌐 Starting Flask server...")
        print("📊 ML Validation Engine: Ready")
        print("🔗 Server URL: http://localhost:5000")
        print("🏥 Health Check: http://localhost:5000/api/health")
        print("\n⚡ Server is starting up...")
        
        # Start the Flask app
        app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
        
    except Exception as e:
        print(f"✗ Failed to start server: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure you're in the correct directory")
        print("2. Check that all Python dependencies are installed")
        print("3. Verify that server/app.py exists")
        sys.exit(1)

if __name__ == "__main__":
    main()
