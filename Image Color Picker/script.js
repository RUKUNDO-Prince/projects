//Create Initial references
let pickColor = document.getElementById("pick-color");
let error = document.getElementById("error");
let fileInput = document.getElementById("file");
let image = document.getElementById("image");
let hexValRef = document.getElementById("hex-val-ref");
let rgbValRef = document.getElementById("rgb-val-ref");
let customAlert = document.getElementById("custom-alert");
let pickedColorRef = document.getElementById("picked-color-ref");
let eyeDropper;

//Function On Window Load
window.onload = () => {
  //Check if the browser supports eyedropper
  if ("EyeDropper" in window) {
    pickColor.classList.remove("hide");
    eyeDropper = new EyeDropper();
  } else {
    error.classList.remove("hide");
    error.innerText = "Your browser doesn't support Eyedropper API";
    pickColor.classList.add("hide");
    return false;
  }
};

//Eyedropper logic
const colorSelector = async () => {
  const color = await eyeDropper
    .open()
    .then((colorValue) => {
      error.classList.add("hide");
      //Get the hex color code
      let hexValue = colorValue.sRGBHex;
      //Convert Hex Value To RGB
      let rgbArr = [];
      for (let i = 1; i < hexValue.length; i += 2) {
        rgbArr.push(parseInt(hexValue[i] + hexValue[i + 1], 16));
        console.log(rgbArr);
      }
      let rgbValue = "rgb(" + rgbArr + ")";
      console.log(hexValue, rgbValue);
      result.style.display = "grid";
      hexValRef.value = hexValue;
      rgbValRef.value = rgbValue;
      pickedColorRef.style.backgroundColor = hexValue;
    })
    .catch((err) => {
      error.classList.remove("hide");
      //If user presses escape to close the eyedropper
      if (err.toString().includes("AbortError")) {
        error.innerText = "";
      } else {
        error.innerText = err;
      }
    });
};

//Button click
pickColor.addEventListener("click", colorSelector);

//Allow user to choose image of their own choice
fileInput.onchange = () => {
  result.style.display = "none";
  //The fileReader object helps to read contents of file stored on computer
  let reader = new FileReader();
  //readAsDataURL reads the content of input file
  reader.readAsDataURL(fileInput.files[0]);
  reader.onload = () => {
    //onload is triggered after file reading operation is successfully completed
    //set src attribute of image to result/input file
    image.setAttribute("src", reader.result);
  };
};

//Function to copy the color code
let copy = (textId) => {
  //Selects the text in the <input> element
  document.getElementById(textId).select();
  //Copies the selected text to clipboard
  document.execCommand("copy");
  //Display Alert
  customAlert.style.transform = "scale(1)";
  setTimeout(() => {
    customAlert.style.transform = "scale(0)";
  }, 2000);
};
