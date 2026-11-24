import os
import sys

# Disable SQLAlchemy C extensions to ensure Cython compatibility on all Python 3.11 builds
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"
