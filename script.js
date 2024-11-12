const url = 'your-pdf-url.pdf'; // Replace with the URL of your PDF file
let pdfDoc = null;
let pageNum = 1;
let pageCount = 0;
let role = '';
let socket;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.js';

// WebSocket connection to the server
function connectSocket() {
    socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
        console.log('Connected to WebSocket');
        socket.send(JSON.stringify({ type: 'join', role }));
    };

    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data.type === 'page_update') {
            loadPage(data.page);
        }
    };
}

// Initialize the PDF document
function loadPDF() {
    pdfjsLib.getDocument(url).promise.then((pdf) => {
        pdfDoc = pdf;
        pageCount = pdf.numPages;
        document.getElementById('page-count').textContent = pageCount;
        loadPage(pageNum);
    });
}

// Load a specific page
function loadPage(num) {
    pageNum = num;
    document.getElementById('page-num').textContent = pageNum;

    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const pdfViewer = document.getElementById('pdf-viewer');
        pdfViewer.innerHTML = ''; // Clear previous page
        pdfViewer.appendChild(canvas);

        page.render({
            canvasContext: ctx,
            viewport: viewport
        });
    });
}

// Page navigation
function nextPage() {
    if (pageNum >= pageCount) return;
    pageNum++;
    updatePage();
}

function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    updatePage();
}

// Update the page and sync if admin
function updatePage() {
    loadPage(pageNum);
    if (role === 'admin') {
        socket.send(JSON.stringify({ type: 'page_change', page: pageNum }));
    }
}

// Select user role
function selectRole(selectedRole) {
    role = selectedRole;
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('pdf-controls').style.display = 'block';
    loadPDF();
    connectSocket();

    // Hide controls for viewers
    if (role === 'viewer') {
        document.getElementById('prev').style.display = 'none';
        document.getElementById('next').style.display = 'none';
    }
}
