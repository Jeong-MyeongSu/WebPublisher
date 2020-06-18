var i=0;
var j=0;
var k=0;
var l=0;
var m=0;



function expand(){
  if(i==0){
    document.getElementById("plus").style.transform="rotate(45deg)";
    document.getElementById("menu_bar").style.transform="translate(0px, -110px)";
    document.getElementById("division1").style.transform="translate(0px, -110px)";
    document.getElementById("division2").style.transform="translate(0px, -110px)";
    document.getElementById("division3").style.transform="translate(0px, -110px)";
    i=1;
  }
  else{
    document.getElementById("plus").style.transform="rotate(0deg)";
    document.getElementById("menu_bar").style.transform="translate(0px, 0px)";


    i=0;
  }
}
function expand2(){
  if(j==0){
    document.getElementById("color").style.transform="translate(0px, 110px)";
    document.getElementById("width").style.transform="translate(0px, 110px)";
    document.getElementById("tool").style.transform="translate(0px, 110px)";
    document.getElementById("owner").style.transform="translate(0px, 110px)";
    document.getElementById("colors").style.transform="translate(0px, -110px)";
    j=1;
    k=1;
    l=1;
    m=1;
  }
}
function backspace1(){
  if(j==1){
    document.getElementById("color").style.transform="translate(0px, 0px)";
    document.getElementById("width").style.transform="translate(0px, 0px)";
    document.getElementById("tool").style.transform="translate(0px, 0px)";
    document.getElementById("owner").style.transform="translate(0px, 0px)";
    document.getElementById("colors").style.transform="translate(0px, 0px)";
    document.getElementById("widths").style.transform="translate(0px, 0px)";
    document.getElementById("tools").style.transform="translate(0px, 0px)";
    document.getElementById("owners").style.transform="translate(0px, 0px)";
    j=0;
    k=0;
    l=0;
    m=0;
  }
}
function expand3(){
  if(k==0){
    document.getElementById("color").style.transform="translate(0px, 110px)";
    document.getElementById("width").style.transform="translate(0px, 110px)";
    document.getElementById("tool").style.transform="translate(0px, 110px)";
    document.getElementById("owner").style.transform="translate(0px, 110px)";
    document.getElementById("widths").style.transform="translate(0px, -110px)";
    k=1;
    j=1;
    l=1;
    m=1;
  }
}
function expand4(){
 if(l==0){
   document.getElementById("color").style.transform="translate(0px, 110px)";
   document.getElementById("width").style.transform="translate(0px, 110px)";
   document.getElementById("tool").style.transform="translate(0px, 110px)";
   document.getElementById("owner").style.transform="translate(0px, 110px)";
   document.getElementById("tools").style.transform="translate(0px, -110px)";
   j=1;
   k=1;
   l=1;
   m=1;
 }
}
function expand5(){
  if(m==0){
    document.getElementById("color").style.transform="translate(0px, 110px)";
    document.getElementById("width").style.transform="translate(0px, 110px)";
    document.getElementById("tool").style.transform="translate(0px, 110px)";
    document.getElementById("owner").style.transform="translate(0px, 110px)";
    document.getElementById("owners").style.transform="translate(0px, -110px)";
    j=1;
    k=1;
    l=1;
    m=1;
  }
}
