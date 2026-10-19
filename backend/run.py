import os
import sys

# Ensure backend root is always in Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import uvicorn
from app.main import app

if __name__ == "__main__":
    app_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "app"))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True, reload_dirs=[app_dir])
