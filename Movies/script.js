function movieApp() {
var answer = prompt("What is your favorite movie?");
var responseElement = document.querySelector("body");
var responseText = "";
switch(answer) {
	case 'pretty woman':
	responseText = "That is a fabulous romantic comedy.";
	break;
	case 'godfather':
	responseText = "A classic.";
	break;
	case 'sound of music':
	responseText = "That is my favorite too.";
	break;
	case 'psycho':
	responseText = "Great suspenseful movie.";
	break;
	default:
    responseText = "Never heard of it.";
}
//* responseElement.innerHTML = responseText;*//
alert(responseText);
}