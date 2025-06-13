const term = document.getElementById('terminal');
const input = document.getElementById('cmd');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const promptPath = document.getElementById('prompt-path');

let FILE_LIST = [];
let fileListLoaded = false;
let pathStack = ["~"];

const MOTD = [
` ██████╗ ███████╗███████╗██╗ █████╗ ███╗   ██╗████████╗`,
` ██╔══██╗██╔════╝██╔════╝██║██╔══██╗████╗  ██║╚══██╔══╝`,
` ██║  ██║█████╗  █████╗  ██║███████║██╔██╗ ██║   ██║   `,
` ██║  ██║██╔══╝  ██╔══╝  ██║██╔══██║██║╚██╗██║   ██║   `,
` ██████╔╝███████╗██║     ██║██║  ██║██║ ╚████║   ██║   `,
` ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   `,
"",
"WARNING: RESTRICTED ACCESS",
"INTRUDERS WILL BE SHOT IF CAUGHT",
"",
"Type 'help' to get started."
];

const BOOT_SEQUENCE = [
  "[SYS] INITIALIZING BIOS...",
  "[SYS] CHECKING MEMORY...OK",
  "[SYS] CONNECTING TO MAINFRAME NODE...",
  "[SYS] CONNECTION ESTABLISHED",
  "[SECURITY] FIREWALL ONLINE",
  "[CRYPTO] DECRYPTING STORAGE MODULES...",
  "[CRYPTO] ACCESS GRANTED",
  "[BOOT SEQUENCE COMPLETE]",
  ""
];

function clearTerm() { term.textContent = ''; }

async function boot() {
  clearTerm();
  for (let line of BOOT_SEQUENCE) {
    term.textContent += line + "\n";
    await delay(500);
  }
  await delay(500);
  clearTerm();
  printLines(MOTD);
  updatePrompt();
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function printLines(lines) {
  term.textContent += lines.join('\n') + "\n";
  term.scrollTop = term.scrollHeight;
}

function updatePrompt() {
  promptPath.textContent = pathStack.join("/") + " >";
  input.focus();
}

input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const cmd = input.value.trim();
    input.value = "";
    runCommand(cmd);
  }
});

function runCommand(inputText) {
  printLines([promptPath.textContent + " " + inputText]);
  const [command, ...args] = inputText.split(" ");
  const arg = args.join(" ");

  switch (command.toLowerCase()) {
    case "help":
      printLines([
        "Available commands:",
        "help         Show this help",
        "ls           List all files",
        "open [file]  Open a file (case-sensitive, use path for subdirs)",
        "clear        Clear the terminal"
      ]);
      break;

    case "ls":
      if (!fileListLoaded) {
        printLines(["Loading file list, please wait..."]);
        return;
      }
      printLines(FILE_LIST.length ? FILE_LIST : ["(no files found)"]);
      break;

    case "open":
      if (!fileListLoaded) {
        printLines(["File list not loaded yet."]);
        return;
      }
      if (FILE_LIST.includes(arg)) {
        openModal(arg);
      } else {
        printLines(["File not found. Use exact path/filename."]);
      }
      break;

    case "clear":
      clearTerm();
      break;

    default:
      printLines(["Unknown command. Type 'help' for a list."]);
  }

  updatePrompt();
}

function openModal(filepath) {
  modalTitle.textContent = filepath;
  modal.style.display = "flex";
  const ext = filepath.split('.').pop().toLowerCase();
  const fileUrl = 'content/' + filepath;

  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(filepath)) {
    modalContent.innerHTML = `<img src="${fileUrl}" alt="${filepath}">`;
  } else if (/\.(html|htm)$/i.test(filepath)) {
    modalContent.innerHTML = `<iframe src="${fileUrl}"></iframe>`;
  } else if (/\.(md|txt|json|js|css)$/i.test(filepath)) {
    fetch(fileUrl)
      .then(r => {
        if (!r.ok) throw new Error('File not found.');
        return r.text();
      })
      .then(text => {
        if (ext === 'md') {
          modalContent.innerHTML = `<pre style="white-space: pre-wrap;">${markdownToHtml(text)}</pre>`;
        } else {
          modalContent.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHtml(text)}</pre>`;
        }
      })
      .catch(() => {
        modalContent.innerHTML = `<div style="padding:2em;">File not found or cannot be loaded.</div>`;
      });
  } else {
    modalContent.innerHTML = `<pre>Unsupported file type.</pre>`;
  }
}

function closeModal() {
  modal.style.display = "none";
  input.focus();
}

// Basic HTML escaping for .txt and code files
function escapeHtml(unsafe) {
  return unsafe.replace(/[&<>"']/g, function(m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];
  });
}

// Simple Markdown to HTML (very basic)
function markdownToHtml(md) {
  return md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' target='_blank'>$1</a>")
    .replace(/\n$/gim, '<br>');
}

// Load file list at startup, then boot
fetch('filelist.json')
  .then(r => {
    if (!r.ok) throw new Error("No filelist.json found in content/");
    return r.json();
  })
  .then(list => {
    FILE_LIST = list;
    fileListLoaded = true;
    boot();
  })
  .catch(err => {
    FILE_LIST = [];
    fileListLoaded = false;
    printLines(["Failed to load filelist.json. Terminal won't work."]);
    updatePrompt();
  });
