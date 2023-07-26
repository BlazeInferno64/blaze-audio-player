const imageBackgroundBanner = document.querySelector(".img-banner");
const body = document.querySelector("body");

let img = [];

img[0] = '../img/img100.jpg';
img[1] = '../img/img101.png';
//img[2] = '../img/img102.jpg';
img[2] = '../img/img103.png';
//img[4] = '../img/img104.jpg';
//img[5] = '../img/img105.jpg';
img[3] = '../img/background.png';
img[4] = '../img/img1.jpg';
img[5] = '../img/img2.jpeg';
img[6] = '../img/img3.jpg';
img[7] = '../img/img4.jpg';
img[8] = '../img/img5.jpg';
img[9] = '../img/img6.jpg';
img[10] = '../img/img7.jpg';
img[11] = '../img/img8.jpg';
img[12] = '../img/img9.jpg';
img[13] = '../img/img10.jpg';
img[14] = '../img/img11.jpg';
img[15] = '../img/img12.jpeg';
img[16] = '../img/img13.jpg';

var num = Math.floor(Math.random()*img.length);
console.log(num);

imageBackgroundBanner.src = img[num];

setInterval(function(e){
    var num = Math.floor(Math.random()*img.length);
console.log(num);

imageBackgroundBanner.src = img[num];
},100000)