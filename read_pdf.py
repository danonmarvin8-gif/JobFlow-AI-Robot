import sys
try:
    import pypdf
    reader = pypdf.PdfReader(sys.argv[1])
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print(text)
except ImportError:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(sys.argv[1])
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        print(text)
    except ImportError:
        import subprocess
        print("PYTHON_PDF_LIBRARIES_MISSING")
