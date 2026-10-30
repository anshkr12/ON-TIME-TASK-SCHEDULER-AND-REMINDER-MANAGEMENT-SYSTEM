import os
import zipfile

def create_project_zip():
    output_filename = "public/task-scheduler-project.zip"
    os.makedirs("public", exist_ok=True)
    
    # Exclude patterns
    excluded_dirs = {
        'node_modules',
        '.git',
        'dist',
        '.vite',
        '__pycache__'
    }
    excluded_files = {
        'task-scheduler-project.zip',
        '.DS_Store',
        'create_zip.py'
    }

    print(f"Creating {output_filename}...")
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in excluded_dirs and not d.startswith('.git')]
            
            for file in files:
                if file in excluded_files or file.endswith('.pyc') or file.endswith('.zip'):
                    continue
                
                # Full filepath
                file_path = os.path.join(root, file)
                # Archive name inside zip (relative to project root)
                archive_name = os.path.relpath(file_path, '.')
                
                # Do not zip the zip file itself
                if archive_name == output_filename or archive_name == os.path.join('.', output_filename):
                    continue

                zipf.write(file_path, archive_name)
                print(f"  Added: {archive_name}")

    file_size_kb = os.path.getsize(output_filename) / 1024
    print(f"Done! {output_filename} created ({file_size_kb:.1f} KB)")

if __name__ == '__main__':
    create_project_zip()
