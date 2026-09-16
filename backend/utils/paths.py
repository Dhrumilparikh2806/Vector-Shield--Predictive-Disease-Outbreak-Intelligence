
import os
import sys

def get_base_path():
    """
    Get the base path of the application.
    - If running as a frozen executable (PyInstaller), use sys._MEIPASS
    - If running locally (script), use the project root (backend/)
    """
    if getattr(sys, 'frozen', False):
        # Running as executable
        return sys._MEIPASS
    else:
        # Running as script
        # This file is in backend/utils/paths.py
        # We want to return backend/
        return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_data_path():
    """
    Get path to data directory (backend/data or bundled data).
    """
    base = get_base_path()
    return os.path.join(base, 'data')

def get_user_data_path():
    """
    Get path to user-writable directory (e.g., %APPDATA%/VectorShield or local for dev).
    For Phase 1 (local dev), we can use the local project folder.
    For Phase 2 (frozen), we might want APPDATA, but let's stick to local relative for now if possible,
    or handle the switch.
    
    Actually, for a packaged app, we MUST write to APPDATA or Documents. 
    Writing to Program Files (where exe is) often fails.
    """
    if getattr(sys, 'frozen', False):
        # Production/Frozen: Use APPDATA
        app_data = os.getenv('APPDATA')
        if app_data:
            path = os.path.join(app_data, 'VectorShield')
            if not os.path.exists(path):
                os.makedirs(path)
            return path
        return os.path.expanduser('~') # Fallback
    else:
        # Local Development: Use project root (backend/)
        return get_base_path()

def get_db_path():
    """
    Get path for SQLite database.
    """
    return os.path.join(get_user_data_path(), 'vectorshield.db')
