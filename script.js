const term = document.getElementById('terminal');
const input = document.getElementById('cmd');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalTitle = document.getElementById('modal-title');
const promptPath = document.getElementById('prompt-path');

let cwd = fileSystem["~"];
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
        "ls           List directory",
        "cd [dir]     Change directory",
        "back         Go back",
        "open [file]  Open a file",
        "clear        Clear the terminal"
      ]);
      break;

    case "ls":
      printLines(Object.keys(cwd));
      break;

    case "cd":
      if (arg && cwd[arg] && typeof cwd[arg] === 'object') {
        cwd = cwd[arg];
        pathStack.push(arg);
      } else {
        printLines(["No such directory."]);
      }
      break;

    case "back":
    case "cd..":
    case "cd ..":
      if (pathStack.length > 1) {
        pathStack.pop();
        cwd = pathStack.reduce((a, d) => a[d], fileSystem);
      } else {
        printLines(["Already at root."]);
      }
      break;

    case "open":
      if (cwd[arg]) {
        openModal(arg, cwd[arg]);
      } else {
        printLines(["File not found."]);
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

function openModal(title, path) {
  modalTitle.textContent = title;
  modal.style.display = "flex";

  if (path.endsWith(".html")) {
    modalContent.innerHTML = `<iframe src="${path}"></iframe>`;
  } else if (/\.(jpg|jpeg|png|gif)$/i.test(path)) {
    modalContent.innerHTML = `<img src="${path}" alt="${title}">`;
  } else {
    modalContent.innerHTML = `<pre>Unsupported file type.</pre>`;
  }
}

function closeModal() {
  modal.style.display = "none";
  input.focus();
}

boot();
