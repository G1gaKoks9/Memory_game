const JUMPSCARE_SOUND = new Audio("sound/jumpscare.wav");
const CARD_REVEAL_SOUND1 = new Audio("sound/card_reveal.mp3");
const CARD_REVEAL_SOUND2 = new Audio("sound/card_reveal.mp3");
const MATCH_SOUND = new Audio("sound/match.mp3");
const WRONG_GUESS_SOUND = new Audio("sound/wrong_guess.mp3");
let oneVisible = false;
let lock = false;
let visibleNr = null;
let turns = 0;
let pairsLeft = 12;
let gridPattern = [];
let imagesLeftToPick = [];
/*
    W pętli:
    1. Dodajemy numery obrazów do listy, z której będziemy losować je dla poszczególnych kart
    2. Dodajemy eventListenery dla każdej pojedynczej karty
*/
for (let i = 0; i < 24; i++) {
    imagesLeftToPick.push(i % 12);

    let handle = document.getElementById('c' + i);
    handle.addEventListener("click", function() { revealCard(i); });
}
// W sposób losowy tworzymy układ kart dla całej planszy (game-board-grid)
while (imagesLeftToPick.length > 0) {
    let imageToPick = Math.floor(Math.random() * imagesLeftToPick.length);
    gridPattern.push("pair" + imagesLeftToPick[imageToPick] + ".png");
    imagesLeftToPick.splice(imageToPick, 1);
}

function revealCard(nr) {
    if ($("#c" + nr).css("opacity") == 0 ||
        nr == visibleNr ||
        lock) return;

    lock = true;
    let revealedImg = "url(img/" + gridPattern[nr] + ")";
    $("#c" + nr).css("background-image", revealedImg);
    $("#c" + nr + "-img").css("opacity", "0");
    $("#c" + nr).addClass("card-revealed");

    if (!oneVisible) {
        // First card is revealed
        CARD_REVEAL_SOUND1.play();
        visibleNr = nr;
        lock = false;
    } else {
        // Second card is revealed
        CARD_REVEAL_SOUND2.play();
        if (gridPattern[nr] == gridPattern[visibleNr]) {
            // Pair is correct
            setTimeout(function() {
                hideTwoCards(nr, visibleNr);
                MATCH_SOUND.play();
            }, 750);
            pairsLeft--;
            if (pairsLeft == 0) { setTimeout(function() { winVideo(); }, 4000); }
        } else {
            // Pair is incorrect
            setTimeout(function() {
                reverseTwoCards(nr, visibleNr);
                WRONG_GUESS_SOUND.play();
            }, 1250);
        }

        turns++;
        $("#score").html("Your turns: " + turns);
    }
    oneVisible = !oneVisible;
}

function hideTwoCards(nr1, nr2) {
    $("#c" + nr1).css("opacity", '0');
    $("#c" + nr2).css("opacity", '0');

    visibleNr = null;
    lock = false;
}

function reverseTwoCards(nr1, nr2) {
    $("#c" + nr1).css("background-image", "url(img/card_bg.jpg)");
    $("#c" + nr1 + "-img").css("opacity", "100");
    $("#c" + nr2).css("background-image", "url(img/card_bg.jpg)");
    $("#c" + nr2 + "-img").css("opacity", "100");

    $("#c" + nr1).removeClass("card-revealed");
    $("#c" + nr2).removeClass("card-revealed");
    
    visibleNr = null;
    lock = false;
}

function winVideo() {
    $("#win-video-box").css("display", "block");
    $("#win-video-box").html('<video id="win-video" width="100%" height="770" autoplay disablePictureInPicture> <source src="video/win_video.mp4" type="video/mp4"> </video>');

    $("#win-video").on("play", function() {
        $(this).animate({ opacity: 1 }, 3500); 
        setTimeout(function() { JUMPSCARE_SOUND.play(); }, 500);
    });

    $("#win-video").on("ended", function() {
        $("#win-video-box").fadeOut(2000);
        gameWon();
    });
}

function gameWon() {
    $("#game-board-grid").css("display", "block");
    $("#game-board-grid").html('<span id="win-message">Congratulations!<br>You won in ' + turns + ' turns!</span>');
    $("#win-message").css("display", "block");
    $("#score-box").css("opacity", "0");
}