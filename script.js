var itemCount = 0;
addItem(); // Initialize with one item input row

function addItem(title = "", price = "", imageLink = "", status = "Available") {
  itemCount++;
  var itemDiv = document.createElement("div");
  itemDiv.className = "container";
  itemDiv.innerHTML = `
        <label>Title:</label>
        <input type="text" class="item-input" id="itemTitle${itemCount}" value="${title}" oninput="handleTitleInput(event, ${itemCount})">
        <label>Price:</label>
        <input type="text" class="item-input" id="itemPrice${itemCount}" value="${price}" oninput="generateMarkdown()">
        <label>Image Link:</label>
        <input type="text" class="item-input" id="itemImageLink${itemCount}" value="${imageLink}" oninput="generateMarkdown()">
        <label>Status:</label>
        <select class="item-input" id="itemStatus${itemCount}" onchange="generateMarkdown()">
            <option value="Available"${
              status === "Available" ? " selected" : ""
            }>Available</option>
            <option value="Pending"${
              status === "Pending" ? " selected" : ""
            }>Pending</option>
            <option value="Sold"${
              status === "Sold" ? " selected" : ""
            }>Sold</option>
        </select>
    `;
  document.getElementById("itemContainer").appendChild(itemDiv);
}

function parseMarkdown() {
  var markdownText = document.getElementById("pasteMarkdown").value;
  var lines = markdownText.split("\n");

  // Reset current items
  document.getElementById("itemContainer").innerHTML = "";
  itemCount = 0;

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("| [**")) {
      // Check for title line
      var titleDetails = extractDetailsFromTitleLine(lines[i]);
      if (i + 1 < lines.length) {
        var priceDetails = extractDetailsFromPriceLine(lines[i + 1]);
        addItem(
          titleDetails.title,
          priceDetails.price,
          titleDetails.imageLink,
          priceDetails.status
        );
        i++; // Skip the next line as it is part of the current item
      }
    }
  }

  generateMarkdown();
  handleTitleInput(event, itemCount);
}

function extractDetailsFromTitleLine(line) {
  // Extract title and image link
  var titleMatch = line.match(/\[\*\*(.*?)\*\*\]\((.*?)\)/);
  var title = titleMatch ? titleMatch[1] : "";
  var imageLink = titleMatch ? titleMatch[2] : "";

  return { title, imageLink };
}

function extractDetailsFromPriceLine(line) {
  // Extract price and status
  var priceMatch = line.match(/\^\(--\$(.*?) \/ (.*?)\)/);
  var price = priceMatch ? priceMatch[1] : "";
  var status = priceMatch ? priceMatch[2] : "";

  return { price, status };
}

// This function checks if a new item row should be added
function checkForNewItem() {
    // Get the title of the last item row
    var lastTitle = document.getElementById(`itemTitle${itemCount}`).value.trim();
    // If the last title is not empty and there is no next item row, add a new one
    if (lastTitle !== "" && itemCount === document.querySelectorAll('#itemContainer .container').length) {
        addItem();
    }
}
// This function is called when the title input is changed
function handleTitleInput(event, index) {
    if (index === itemCount) { // Only check for new item if the current item is the last one
        checkForNewItem();
    }
    generateMarkdown();
}

// ... rest of your existing script ...

function generateMarkdown() {
  var timestampLink = document.getElementById("timestampLink").value.trim();
  var introText = document.getElementById("introText").value.trim();
  var outroText = document.getElementById("outroText").value.trim();
  var userName = document.getElementById("userName").value.trim();
  if (userName !== "") {
    var userNameLink =
      "---\n [DIRECT PM](https://reddit.com/message/compose/?to=" +
      userName +
      ")";
    console.log(userNameLink); // Or use this link as needed
  } else {
    userNameLink = "";
  }

  if (timestampLink !== "") {
    var timestamp = "[timestamp](" + timestampLink + ")";
    console.log(timestamp); // Or use this link as needed
  } else {
    timestamp = "";
  }

  var markdownText = `${timestamp}\n\n${introText}\n---\n\n`;

  markdownText += "| For Sale |\n"; // Adjust the headers
  markdownText += "|-------|\n";

  // Loop through each item and check if the title input has a value
  for (var i = 1; i <= itemCount; i++) {
    var titleInput = document.getElementById(`itemTitle${i}`).value.trim();
    var price = document.getElementById(`itemPrice${i}`).value.trim();
    var imageLinkInput = document.getElementById(`itemImageLink${i}`).value.trim();
    var statusSelect = document.getElementById(`itemStatus${i}`);

    // Trim the inputs to remove any extra whitespace
    var status = statusSelect.value;

    // Skip the loop iteration if the title field is empty
    if (titleInput === "") continue;

    if (status === "Sold") {
        title = "**~~" + titleInput + "~~**";
    } else if (status === "Pending") {
        title = "***" + titleInput + "***";
    } else{
        title = "**" + titleInput + "**"
        }
    

    // Make the title a hyperlink if an image link is provided
    var linkedTitle = imageLinkInput ? `[${title}](${imageLinkInput})` : title;

    // Use caret for superscript in Markdown and <sup> for HTML rendering
    var priceAndStatusMarkdown = `^(--$${price} / ${status})`;

    // Concatenate the row for the Markdown output
    markdownText += `| ${linkedTitle} |\n|${priceAndStatusMarkdown}|\n||\n`;
  }
  markdownText += `\n---\n${outroText}\n${userNameLink}\n`;

  var markdownOutput = document.getElementById("markdownOutput");
  markdownOutput.value = markdownText; // Set the text in the textarea element

  // For the live preview, convert the Markdown to HTML and replace Markdown superscript syntax with HTML <sup> tags
  if (window.marked) {
    var renderedHTML = window.marked.parse(markdownText);
    renderedHTML = renderedHTML.replace(
      /\^(\(--\$.+? \/ .+?\))/g, // Match caret and parentheses only
      "<sup>$1</sup>" // Keep the content as is, wrapped in <sup> tags
    );

    document.getElementById("livePreview").innerHTML = renderedHTML;
  } else {
    console.error("marked.js library is not loaded.");
  }
}
function clearAllFields() {
  // Reset the value of the timestamp and username input fields
  document.getElementById("timestampLink").value = "";
  document.getElementById("userName").value = "";
  document.getElementById("pasteMarkdown").value = "";

  // Clear the intro text if you have an input field for it
  document.getElementById("introText").value = "";
  document.getElementById("outroText").value = "";

  // Clear all item input fields
  for (var i = 1; i <= itemCount; i++) {
    document.getElementById("itemTitle" + i).value = "";
    document.getElementById("itemPrice" + i).value = "";
    document.getElementById("itemImageLink" + i).value = "";
    document.getElementById("itemStatus" + i).selectedIndex = 0; // Resets to the first option
  }

  // Update the Markdown output and live preview
  generateMarkdown();
}

// ... rest of your existing script ...
document.addEventListener("DOMContentLoaded", function() {
    var collapsible = document.querySelector('.collapse-button');
    var content = document.querySelector('.paste');

    collapsible.addEventListener('click', function() {
        this.classList.toggle("active");
        if (content.style.display === "block") {
            content.style.display = "none";
            collapsible.innerHTML = "🔀 Paste";
        } else {
            content.style.display = "block";
            collapsible.innerHTML = "🫣 Hide";

        }
    });
})

function copyMarkdown() {
  // Use `.value` for textarea instead of `.innerText`
  var markdownText = document.getElementById("markdownOutput").value;
  navigator.clipboard.writeText(markdownText).then(
    function () {
      console.log("Copying to clipboard was successful!");
      // Optionally, you could give user feedback that the text was copied.
    },
    function (err) {
      console.error("Could not copy text: ", err);
    }

    
  );
}
