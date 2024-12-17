// Helper function to normalize text
function normalize(text) {
    return text.replace(/[,]+/g, '').toLowerCase();
}

// Function to compare scripts
function compareScripts() {
    const script1 = document.getElementById('script1').value;
    const script2 = document.getElementById('script2').value;

    const words1 = script1.split(/\s+/);
    const words2 = script2.split(/\s+/);

    const normWords1 = words1.map(normalize);
    const normWords2 = words2.map(normalize);

    const highlighted1 = highlightDifferences(words1, normWords2);
    const highlighted2 = highlightDifferences(words2, normWords1);

    const output = `<p><strong>Script 1:</strong><br>${highlighted1}</p>
                    <p><strong>Script 2:</strong><br>${highlighted2}</p>`;
    document.getElementById('output').innerHTML = output;

    calculateScript2Accuracy(words1, normWords1, normWords2);
}

// Function to highlight differences
function highlightDifferences(originalWords, otherNormalizedWords) {
    let otherWordCounts = {};
    otherNormalizedWords.forEach(word => {
        otherWordCounts[word] = (otherWordCounts[word] || 0) + 1;
    });

    return originalWords.map((word) => {
        const normalizedWord = normalize(word);
        if (otherWordCounts[normalizedWord]) {
            otherWordCounts[normalizedWord]--;
            return word;
        } else {
            return `<span class="difference">${word}</span>`;
        }
    }).join(' ');
}

// Function to calculate and display Script 2 accuracy
function calculateScript2Accuracy(words1, normWords1, normWords2) {
    let matchingWords2 = 0;
    let tempWords1 = [...normWords1]; // Copy of Script 1's normalized words

    normWords2.forEach(word => {
        const index = tempWords1.indexOf(word);
        if (index !== -1) {
            matchingWords2++;
            tempWords1.splice(index, 1);
        }
    });

    const accuracy2 = (matchingWords2 / normWords2.length) * 100;

    // Display only Script 2's accuracy
    document.getElementById('output').innerHTML += `<p><strong>Script 2 Accuracy:</strong> ${accuracy2.toFixed(2)}%</p>`;
}

// Function to update word counts for both scripts
function updateWordCount() {
    const script1 = document.getElementById('script1').value.trim();
    const script2 = document.getElementById('script2').value.trim();

    const wordCount1 = script1 === '' ? 0 : script1.split(/\s+/).length;
    const wordCount2 = script2 === '' ? 0 : script2.split(/\s+/).length;

    document.getElementById('wordCount1').innerText = `Word Count: ${wordCount1}`;
    document.getElementById('wordCount2').innerText = `Word Count: ${wordCount2}`;
}

// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        const extension = file.name.split('.').pop().toLowerCase();

        reader.onload = function(e) {
            const content = e.target.result;
            if (extension === 'txt') {
                document.getElementById('script1').value = content;
                updateWordCount();
            } else if (extension === 'docx') {
                mammoth.extractRawText({ arrayBuffer: content })
                    .then(function(result) {
                        document.getElementById('script1').value = result.value;
                        updateWordCount();
                    })
                    .catch(function(err) {
                        alert('Error reading .docx file: ' + err.message);
                    });
            } else {
                alert('Unsupported file type. Please upload a .txt or .docx file.');
            }
        };

        if (extension === 'txt') {
            reader.readAsText(file);
        } else if (extension === 'docx') {
            reader.readAsArrayBuffer(file);
        }
    }
}

// Function to download the report as a PDF
function downloadReport() {
    const outputElement = document.getElementById('output');

    // Use html2canvas to convert the output to an image, then save as PDF
    html2canvas(outputElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        const imgWidth = 190; // Fit width in A4 PDF
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.setFontSize(40); // Increased font size in the PDF (adjust as needed)
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save('Comparison_Report.pdf');
    });
}
