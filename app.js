// Global selections and variables

const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const lockButtons = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;
//For local storage
let savedPalletes = [];

//EventListeners
generateBtn.addEventListener('click', randomColors);

sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener('transitionend', () => {
  const popupBox = popup.children[0];
  popupBox.classList.remove('active');
  popup.classList.remove('active');
});
adjustButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  });
});

lockButtons.forEach((button, index) => {
  button.addEventListener('click', (e) => {
    lockLayer(e, index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
});

// FUNCTIONS

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    console.log(hexText.innerText);

    const randomColor = chroma.random();
    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    //Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor.toString().toUpperCase();

    checkTextContrast(randomColor, hexText);
    checkTextContrast(initialColors[index], adjustButtons[index]);
    checkTextContrast(initialColors[index], lockButtons[index]);
    //Initialize colors from sliders (hue, brightness, saturation)
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //Actualiza los sliders en la posici??n que deber??an estar
  resetInputs();
  // adjustButtons.forEach((button, index) => {
  //   checkTextContrast(initialColors[index], button);
  //   checkTextContrast(initialColors[index], lockButtons[index]);
  // });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = 'black';
  } else {
    text.style.color = 'white';
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSaturation = color.set('hsl.s', 0);
  const fullSaturation = color.set('hsl.s', 1);
  const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);
  //Scale Brightness
  const midBrightness = color.set('hsl.l', 0.5);
  const scaleBrightness = chroma.scale(['white', midBrightness, 'black']);
  //Scale Hue

  //Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSaturation(
    0
  )},${scaleSaturation(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBrightness(
    0
  )},${scaleBrightness(0.5)},${scaleBrightness(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue');
  let sliders = e.target.parentElement.querySelectorAll(
    'input[type = "range"]'
  );
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

  colorDivs[index].style.backgroundColor = color;
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = color.hex();
  //Check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach((slider) => {
    if (slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === 'brightness') {
      const brightnessColor = initialColors[slider.getAttribute('data-bright')];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      slider.value = Math.floor(brightnessValue * 100) / 100;
    }
    if (slider.name === 'saturation') {
      const saturationColor = initialColors[slider.getAttribute('data-sat')];
      const saturationValue = chroma(saturationColor).hsl()[1];
      slider.value = Math.floor(saturationValue);
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  //Animaci??n al copiar un color
  const popupBox = popup.children[0];
  popup.classList.add('active');
  popupBox.classList.add('active');
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle('locked');

  if (lockSVG.classList.contains('fa-lock-open')) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

//Save palette y local storage
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');




//Event Listeners
saveBtn.addEventListener("click",openPalette);
closeSave.addEventListener("click",closePalette);







function openPalette(e){
  const popup = saveContainer.children[0];
  saveContainer.classList.add('active');
  popup.classList.add('active');
}

function closePalette(e){
  const popup = saveContainer.children[0];
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
}


const libraryBtn = document.querySelector('.library');
const libraryContainer = document.querySelector('.library-container');
const closeLib = document.querySelector('.close-library');

libraryBtn.addEventListener("click",openLibrary);
closeLib.addEventListener("click",closeLibrary);

function openLibrary(e){
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add('active');
  popup.classList.add('active');
}

function closeLibrary(e){
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove('active');
  popup.classList.remove('active');
}
randomColors();
