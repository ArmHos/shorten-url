function postUrl() {
  const input = document.querySelector("input");
  const urlSpan = document.getElementById("short-url");
  const button = document.querySelector("button");
  button.addEventListener("click", async () => {
    sendData(input, urlSpan);
  });
  input.addEventListener("keydown", async (e) => {
    if (e.code === "Enter") {
      sendData(input, urlSpan);
    }
  });
}
async function getURLData() {
  const table = document.querySelector("table");
  const tableCont = document.querySelector(".table-cont");
  const messageDiv = document.querySelector(".message");
  table.innerHTML = `
        <tr>
          <th>Short Link</th>
          <th>Original Link</th>
          <th>QR</th>
        </tr>
    `;
  try {
    const res = await fetch("/data");
    const data = await res.json();
    let URLData = JSON.parse(data);
    console.log(URLData);
    if (URLData.length !== 0) {
      tableCont.style.display = "flex";
      messageDiv.style.display = "none";
      URLDataTable(URLData, table);
    } else {
      messageDiv.style.display = "flex";
      console.log(messageDiv);
    }
  } catch (err) {
    throw new Error(err);
  }
}
function URLDataTable(data, table) {
  data.forEach((item) => {
    table.innerHTML += `
        <tr>
          <td><span>${item.updatedURL} </span><img src="./Assets/copy.png" id="short-url-copy"></td>
          <td>
          <div class="original-link">
          <img src="${item.faviconLinkPNG}" alt=" " id="short-url-favicon"/>
            ${item.url}
          </div>
            </td>
          <td><img src="${item.QR}" id="QR"/></td>
        </tr>
        `;
  });
  const copyButtons = document.querySelectorAll("#short-url-copy");
  copyButtonsHandler(copyButtons);
}
function copyButtonsHandler(copyButtons) {
  copyButtons.forEach((copyButton) => {
    copyButton.addEventListener("click", (e) => {
      const textToCopy = e.target.parentNode.firstChild.textContent;
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          e.target.src = "./Assets/copyCompleted.png";
          setTimeout(() => {
            e.target.src = "./Assets/copy.png";
          }, 2000);
        })
        .catch((error) => {
          console.error("Error copying text to clipboard:", error);
        });
      console.log();
    });
  });
}
async function sendData(input, urlSpan) {
  let value = input.value.trim();
  if (value) {
    try {
      const res = await fetch("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: value,
        }),
      });
      input.value = "";
      const { message, updatedURL, faviconLinkPNG, QR } = await res.json();
      if (updatedURL) {
        try {
          input.style.border = "none";
          urlSpan.innerHTML = `${message}`;
          getURLData();
        } catch (err) {
          throw new Error(err);
        }
      } else {
        input.style.border = "solid 2px red";
        urlSpan.innerHTML = `${message}`;
      }
      console.log(message, updatedURL, faviconLinkPNG, QR);
    } catch (err) {
      throw new Error(err);
    }
  }
}
getURLData();
postUrl();
