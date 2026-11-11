import sys
import os
import importlib.machinery
from importlib.machinery import FileFinder, SourceFileLoader, SourcelessFileLoader, ExtensionFileLoader, SOURCE_SUFFIXES, BYTECODE_SUFFIXES, EXTENSION_SUFFIXES

class CythonFallbackExtensionLoader(ExtensionFileLoader):
    def create_module(self, spec):
        try:
            return super().create_module(spec)
        except (ImportError, OSError):
            dir_name, base_name = os.path.split(spec.origin)
            simple_name = base_name.split('.')[0] + '.py'
            py_path = os.path.join(dir_name, simple_name)
            if os.path.exists(py_path):
                loader = SourceFileLoader(spec.name, py_path)
                spec.loader = loader
                spec.origin = py_path
                return loader.create_module(spec)
            raise

    def exec_module(self, module):
        if getattr(module, '__spec__', None) and isinstance(module.__spec__.loader, SourceFileLoader):
            module.__spec__.loader.exec_module(module)
            return
        try:
            super().exec_module(module)
        except (ImportError, OSError):
            dir_name, base_name = os.path.split(module.__file__)
            simple_name = base_name.split('.')[0] + '.py'
            py_path = os.path.join(dir_name, simple_name)
            if os.path.exists(py_path):
                loader = SourceFileLoader(module.__name__, py_path)
                module.__file__ = py_path
                loader.exec_module(module)
            else:
                raise

loaders = [
    (CythonFallbackExtensionLoader, EXTENSION_SUFFIXES),
    (SourceFileLoader, SOURCE_SUFFIXES),
    (SourcelessFileLoader, BYTECODE_SUFFIXES)
]
sys.path_hooks = [FileFinder.path_hook(*loaders)]
sys.path_importer_cache.clear()

