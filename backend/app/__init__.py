import os
import sys

# Ensure sitecustomize is loaded to bypass blocked Cython binaries on Windows
try:
    import sitecustomize
except ImportError:
    pass

