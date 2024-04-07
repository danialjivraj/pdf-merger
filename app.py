from io import BytesIO
from PyPDF2 import PdfMerger
from flask import Flask, request, send_file, render_template, flash, redirect, url_for

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def merge_pdfs():
    if request.method == 'POST':
        pdf_files = request.files.getlist("pdf_files")
        file_order = request.form.get("file_order")
        
        if file_order:
            indices = filter(lambda x: x.strip(), file_order.split(","))
            
            file_order_list = []
            for index in indices:
                try:
                    file_order_list.append(int(index))
                except ValueError:
                    flash(f"Error: Invalid index encountered: {index}", 'error')
                    return redirect(url_for('merge_pdfs'))
        else:
            file_order_list = range(len(pdf_files))

        merger = PdfMerger()
        for index in file_order_list:
            if index < len(pdf_files):
                pdf = pdf_files[index]
                merger.append(pdf)
            else:
                flash(f"Error: Index {index} out of range", 'error')

        if merger.pages:
            buffer = BytesIO()
            merger.write(buffer)
            buffer.seek(0)

            return send_file(buffer, as_attachment=True, download_name="merged.pdf")
        else:
            flash("Error: No PDFs selected or merged successfully", 'error')
            return redirect(url_for('merge_pdfs'))

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
