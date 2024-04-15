/*
* Name: Nguyễn Đình Lam
* ID student: 21130416
* Class: DH21DTC
* Phone number: 0855354919
*/

/*Tạo kết quả khi banh đụng tường*/
const TouchDirection = {"EAST": 1, "WEST": 2, "SOUTH": 3, "NORTH": 4, "NONE": 0, "REMOVE": -1}

/* Bộ màu sắc*/
const colors = ["#e11919", "#0b4689", "#000", "#036a0c", "#ab02b5", "#5b014a"];

/* Biến quản lý kích thước khung trò chơi (khung canvas)*/
const screenWidth = 777.5, screenHeight = window.innerHeight - 18;
/* Biến tương tác canvas*/
let canvas, contentCanvas;

/* Biến các âm thanh*/
const SOUND = {
    'SOUND_EFFECT_COLLIDE': 0,
    'SOUND_EFFECT_INTRODUCE': 1,
    'SOUND_EFFECT_OPEN_GAME': 2,
    'SOUND_EFFECT_PLAY_GAME': 3,
    'SOUND_EFFECT_EAT_ITEM': 4,
    'SOUND_EFFECT_HOVER': 5,
    'SOUND_EFFECT_CLICK': 6,
    'SOUND_EFFECT_WIN': 7,
    'SOUND_EFFECT_LOSE': 8
};

/* Biến tạo 2 tường cho level 6*/
let wallLeft, wallRight;

/* Các biến liên quan đến thanh bar*/
const barWidth = 150, barHeight = 10, spaseBarCompareToScreen = 50, barX = screenWidth / 2 - barWidth / 2,
    barY = screenHeight - barHeight - spaseBarCompareToScreen;
let bar;

/* Các biến liên quan đến quả banh (ball)*/
const ballX = barX + barWidth / 2, ballY = barY, ballSize = 10;

/* Các biến liên quan đến thông số game*/
const rows = 5, speed = 8;
let score = 0;

/* Các biến liên quan đến trạng thái của game và các element*/
let isMoveBar = false, run = false, pause = false, level = 1, start = true,
    displayIntroduce = false, reverse = 1, upSpeed = 1;

/* Các biến danh sách các element*/
let listBall = [], listObstacle = [], listItem = [], listStone = [];

$(document).ready(() => {
    const buttonContinueGame = $('.continue-game');
    const button = $('.button');
    const menuItem = $(".menu-item");

    $('.new-game').on("click", function () {
        playSoundEffectBackground(SOUND.SOUND_EFFECT_OPEN_GAME, SOUND.SOUND_EFFECT_PLAY_GAME)
        clearDataGame();
        level = 1
        score = 0;
        setScore(score)
        newGame();
        $(".main-menu").css({'transform': 'translateX(100%)'});
        $("main").css({'transform': 'translateX(0%)'});
        setTimeout(() => {
            $(".right-menu").css({'transform': 'translateX(0%)'});
        }, 500)
    })

    $(".quit-game").on("click", function () {
        pause = true;
        run = false;
        if (confirm("Bạn có chắc muốn thoát game không!")) {
            quitGame();
            saveDataGame()
            buttonContinueGame.show()
            playSoundEffectBackground(SOUND.SOUND_EFFECT_PLAY_GAME, SOUND.SOUND_EFFECT_OPEN_GAME)
        } else if (!start) {
            setUpFrameCountDown();
            countDown();
        }
    })

    $(".pause-game").on("click", function () {
        pause = true;
        run = false;
        alert("Tiếp tục trò chơi")
        setUpFrameCountDown();
        countDown();
    })

    $('.choose-level').on("click", function (event) {
        level = parseInt($(this).val())
        score = 0;
        setScore(score)
        newGame();
        clearDataGame();
        buttonContinueGame.hide()
        $(".main-menu").css({'transform': 'translateX(100%)'});
        $("main").css({'transform': 'translateX(0%)'});
        $(".right-menu").css({'transform': 'translateX(0%)'});
        playSoundEffectBackground(SOUND.SOUND_EFFECT_OPEN_GAME, SOUND.SOUND_EFFECT_PLAY_GAME)
    });

    $(".next-game").on("click", function (event) {
        if (level < 6) {
            level++
            newGame();
            clearDataGame();
            buttonContinueGame.hide()
            $(".main-menu").css({'transform': 'translateX(100%)'});
            $("main").css({'transform': 'translateX(0%)'});
            $(".right-menu").css({'transform': 'translateX(0%)'});
        }else
            quitGame()

        if (level === 6)
            $(this).find("span").text("Quit Game")
        else
            $(this).find("span").text("Next level")
    });

    $('.introduce-game').on('click', function (event) {
        playSoundEffectBackground(SOUND.SOUND_EFFECT_OPEN_GAME, SOUND.SOUND_EFFECT_INTRODUCE)
        $("#introduce").css({"transition": "30s linear", "transform": "translateY(-200%)"})
        displayIntroduce = true;
        setTimeout(() => {
            $("#introduce").css({"transition": "0ms linear", "transform": "translateY(0%)"})
            playSoundEffectBackground(SOUND.SOUND_EFFECT_INTRODUCE, SOUND.SOUND_EFFECT_OPEN_GAME)
            displayIntroduce = false;
        }, 30 * 1000)
    });

    if (!localStorage.getItem("bar")) buttonContinueGame.hide()
    buttonContinueGame.on("click", function (event) {
        loadDataGame()
        clearDataGame()
        continueGame()
        playSoundEffectBackground(SOUND.SOUND_EFFECT_OPEN_GAME, SOUND.SOUND_EFFECT_PLAY_GAME)
    })

    $("#sound_effect_open_game")[0].addEventListener("canplay", function () {
        this.play()
    })

    button.on("mouseover", function (event) {
        playSoundEffect(SOUND.SOUND_EFFECT_HOVER)
    })

    button.on("mousedown", function (event) {
        playSoundEffect(SOUND.SOUND_EFFECT_CLICK)
    })

    menuItem.on("mouseover", function (event) {
        playSoundEffect(SOUND.SOUND_EFFECT_HOVER)
    })

    menuItem.on("mousedown", function (event) {
        playSoundEffect(SOUND.SOUND_EFFECT_CLICK)
    })
});

/*Sự kiện của các nút*/
$(document).on("keydown", function (event) {
    switch (event.keyCode) {
        case 27: {
            if (!pause && !start) {
                pause = true;
                if (confirm("Bạn có muốn tiếp tục trò chơi không\nNhấn \"OK\" để tiếp tục trò chơi")) {
                    setUpFrameCountDown();
                    countDown();
                } else {
                    quitGame();
                    playSoundEffectBackground(SOUND.SOUND_EFFECT_PLAY_GAME, SOUND.SOUND_EFFECT_OPEN_GAME)
                }
            }
            break;
        }
    }
});

/*Sự kiện hủy chức năng của nut "Introduce"*/
$("body").on("click", function (event) {
    if (displayIntroduce && $(event.target).parents(".introduce-game")[0] !== $('.introduce-game')[0]) {
        $("#introduce").css({"transition": "0ms linear", "transform": "translateY(0%)"})
        displayIntroduce = false;
        $("#sound_effect_introduce")[0].pause();
        playSoundEffectBackground(SOUND.SOUND_EFFECT_INTRODUCE, SOUND.SOUND_EFFECT_OPEN_GAME)
    }
});

/*khởi tạo */
const createSoundEffect = (name) => {
    switch (name) {
        case SOUND.SOUND_EFFECT_COLLIDE:
            return $('#sound_effect_collide')[0];
        case SOUND.SOUND_EFFECT_INTRODUCE:
            return $("#sound_effect_introduce")[0];
        case SOUND.SOUND_EFFECT_PLAY_GAME:
            return $("#sound_effect_play_game")[0];
        case SOUND.SOUND_EFFECT_OPEN_GAME:
            return $("#sound_effect_open_game")[0];
        case SOUND.SOUND_EFFECT_EAT_ITEM:
            return $("#sound_effect_eat_item")[0];
        case SOUND.SOUND_EFFECT_CLICK:
            return $("#sound_effect_click")[0];
        case SOUND.SOUND_EFFECT_HOVER:
            return $("#sound_effect_hover")[0];
        case SOUND.SOUND_EFFECT_WIN:
            return $("#sound_effect_win_game")[0];
        case SOUND.SOUND_EFFECT_LOSE:
            return $("#sound_effect_lose_game")[0];
    }
}

/*Tạo âm thanh nèn cho trò chơi lúc mới mở game*/
function playSoundEffectBackground(nameSoundCurrent, nameSoundPlay) {
    const soundCurrent = createSoundEffect(nameSoundCurrent);
    const soundPlay = createSoundEffect(nameSoundPlay);
    soundCurrent.pause()
    soundPlay.currentTime = 0;
    soundPlay.play()
}

const playSoundEffect = (nameSound) => {
    const sound = createSoundEffect(nameSound);
    sound.pause();
    sound.currentTime = 0;
    sound.addEventListener('canplay', function () {
        sound.play()
    })
}


/*Sự kiện tạo mới bảng game*/
const createBroadGame = () => {
    $("#board_game").html(`<canvas id="canvas"></canvas>`)
    canvas = $("#canvas");

    canvas.attr("width", screenWidth);
    canvas.attr("height", screenHeight);

    contentCanvas = canvas[0].getContext("2d");

    if (level === 6)
        $('.next-game').find("span").text("Quit Game")
    else
        $('.next-game').find("span").text("Next level")

    let pointMousePrevious = 0;
    /*event move bar and start game*/
    canvas.mousedown(function (event) {
        isMoveBar = true;
        pointMousePrevious = event.clientX - this.getBoundingClientRect().x;
        if (start) {
            start = false;
            setUpFrameCountDown();
            countDown();
        }

        if (!start && pause) {
            pause = false;
            countDown();
        }
    });

    $(document).on("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return

        if (start) {
            start = false;
            setUpFrameCountDown();
            countDown();
        }

        if (!start && pause) {
            pause = false;
            countDown();
        }

        if (!run || pause) return
        let step = 0;
        switch (event.key) {
            case "ArrowRight":
                step = 15
                break;
            case "ArrowLeft":
                step = -15
                break;
        }

        moveBar(bar, bar.x + bar.width / 2 + step * upSpeed * reverse, screenWidth, contentCanvas);
    })

    canvas.mouseup(event => {
        isMoveBar = false;
    });

    canvas.mousemove(function (event) {
        const elementX = this.getBoundingClientRect().x;
        let pointMouseCurrent = event.clientX - elementX;
        if (isMoveBar && run) {
            moveBar(bar, bar.x + bar.width / 2 + reverse * upSpeed * (pointMouseCurrent - pointMousePrevious), screenWidth, contentCanvas);
        }
        pointMousePrevious = pointMouseCurrent;
    });
}

/*Chạy sụ kiện count down*/
const countDown = () => {
    const textCountDown = $(".text-count-down");
    for (let second = 3; second > 0; second--) {
        setTimeout(() => {
            textCountDown.text(second)
            textCountDown.css({'transform': 'translate(-50%, -50%) scale(1)'});
        }, (3 - second) * 1000)
        setTimeout(() => {
            textCountDown.text(second)
            textCountDown.css({'transform': 'translate(-50%, -50%) scale(0)'});
        }, (3 - second) * 1000 + 500)
    }

    setTimeout(() => {
        $("#count-down").remove();
        pause = false;
        run = true;
        playGame();
        moveWall(-1)
    }, 3000);
}

/*Khởi tạo lớp phú hiển thị việc count down*/
const setUpFrameCountDown = () => {
    const divDisplayCountDown = `
        <div id="count-down">
            <div class="background-hidden"></div>
        
             <div class="display-count-down">
                    <span class="text-count-down" style="">3</span>
             </div>
        </div>
    `;

    $('body').append(divDisplayCountDown);
}

/*Tạo hiệu ứng đếm ngược trước khi bắt đầu chò chơi.*/
const setScore = (score) => {
    const scoreElement = $(".display-score .score");
    scoreElement.css({'transform': 'scale(0)'})
    setTimeout(() => {
        scoreElement.text(score)
        scoreElement.css({'transform': 'scale(1)'})
    }, 250)
}

/*Sự kiện tạo mới game*/
const newGame = () => {
    start = true;
    run = false;
    pause = false;

    createBroadGame();

    listBall = [];
    listObstacle = []
    listItem = [];
    listStone = [];
    bar = new Rectangle(barX, barY, barWidth, barHeight);
    const ball = new Circle(ballX, ballY - ballSize, ballSize);
    ball.draw(contentCanvas);
    listBall.push(ball);

    listStone.push(bar);
    bar.draw(contentCanvas);
    $('.level').text(level)
    drawObstacleByLevel(level, listObstacle, contentCanvas);
}

/*Sự kiện khi game được chạy*/
const playGame = () => {
    let newListBall = listBall;
    for (const index in listBall) {
        if (listObstacle.length === 0) {
            playSoundEffect(SOUND.SOUND_EFFECT_WIN)
            if (level === 6) {
                alert(`Chúc mừng bạn đã chiến thắng trò chơi!`)
                quitGame()
            } else if (confirm(`Chúc mừng bạn đã chiến thắng level ${level}\nNhấn "OK" để tiếp tục chơi level ${++level}`)) {
                createBroadGame()
                newGame();
            } else {
                quitGame()
                playSoundEffectBackground(SOUND.SOUND_EFFECT_PLAY_GAME, SOUND.SOUND_EFFECT_OPEN_GAME)
            }
            return;
        }

        const ball = listBall.at(index);
        let huong = TouchDirection.NONE;
        let dx = ball.dx;
        let dy = ball.dy;
        /*Xử lý va chạm tường*/
        while ((huong = checkCollide(listBall, ball, listObstacle, screenWidth, screenHeight, level)) !== TouchDirection.NONE) {
            if (huong === TouchDirection.WEST || huong === TouchDirection.EAST) {
                playSoundEffect(SOUND.SOUND_EFFECT_COLLIDE);
                const randomDxy = randomAngle(speed);
                dx = dx > 0 ? -randomDxy[0] : randomDxy[0]
                dy = dy > 0 ? randomDxy[1] : -randomDxy[1]
                ball.setDxy(dx, dy);
            }

            if (huong === TouchDirection.SOUTH || huong === TouchDirection.NORTH) {
                playSoundEffect(SOUND.SOUND_EFFECT_COLLIDE);
                const randomDxy = randomAngle(speed);
                dy = dy > 0 ? -randomDxy[0] : randomDxy[0]
                dx = dx > 0 ? randomDxy[1] : -randomDxy[1]
                ball.setDxy(dx, dy);
            }
        }

        if (ball.y - ball.radius > screenHeight) removeElement(newListBall, index)
    }
    drawElements(listBall, listItem, contentCanvas);
    listBall = newListBall;

    bar.draw(contentCanvas);

    if (!pause && run && listBall.length !== 0) requestAnimationFrame(playGame);

    if (listBall.length === 0) {
        playSoundEffect(SOUND.SOUND_EFFECT_LOSE)
        if (confirm("Thua mất rồi!\nBạn có muốn chơi lại không?")) {
            level = 1;
            score = 0;
            createBroadGame()
            newGame();
            setScore(score);
        } else quitGame();
    }
}

/*Sự kiện cho nút "Quit Game"*/
const quitGame = () => {
    start = false
    run = false;
    pause = false;
    $(".right-menu").css({'transform': 'translateX(-120%)'});
    setTimeout(() => {
        $("main").css({'transform': 'translateX(-110%)'});
        $(".main-menu").css({'transform': 'translateX(0)'});
    }, 500);
}

/*Sự kiện cho nút  "Continute Game"*/
const continueGame = () => {
    start = true
    setScore(score)
    $('.level').text(level)
    $('.continue-game').hide()
    createBroadGame()

    listItem.map(item => {
        item.draw(contentCanvas)
    })

    listBall.map(ball => {
        ball.draw(contentCanvas)
    })
    listObstacle.map(obstacle => {
        obstacle.draw(contentCanvas)
    })

    bar.draw(contentCanvas)

    $(".main-menu").css({'transform': 'translateX(100%)'});
    $("main").css({'transform': 'translateX(0%)'});
    setTimeout(() => {
        $(".right-menu").css({'transform': 'translateX(0%)'});
    }, 500)
}

/*Xóa dữ liệu trong local*/
const clearDataGame = () => {
    localStorage.removeItem("balls", listBall);
    localStorage.removeItem("bar", bar);
    localStorage.removeItem("items", listItem);
    localStorage.removeItem("obstacle", listObstacle)
    localStorage.removeItem("score", score)
    $('.continue-game').hide()
}

/*Lưu dữ liệu xuống local*/
const saveDataGame = () => {
    localStorage.setItem("items", JSON.stringify(listItem));
    localStorage.setItem("balls", JSON.stringify(listBall));
    localStorage.setItem("obstacle", JSON.stringify(listObstacle))
    localStorage.setItem("score", score)
}

/*tải dữ liệu từ local*/
const loadDataGame = () => {
    listItem = JSON.parse(localStorage.getItem('items')).map(object => {
        return new Item(object.x, object.y, object.width, object.height)
    })
    listBall = JSON.parse(localStorage.getItem('balls')).map(object => {
        const ball = new Circle(object.x, object.y, object.radius);
        ball.setDxy(object.dx, object.dy);
        ball.setColor(object.color);
        return ball;
    })
    listObstacle = JSON.parse(localStorage.getItem('obstacle')).map((object, index, array) => {
        if (index === 0) {
            const bar = new Rectangle(object.x, object.y, object.width, object.height);
            bar.setColor(object.color)
            return bar;
        } else {
            const obstacle = new Obstacle(object.x, object.y, object.width, object.height);
            obstacle.setBlood(object.blood ? object.blood : undefined);
            obstacle.setColor(object.color)
            return obstacle;
        }
    })
    score = parseInt(localStorage.getItem("score"))
    bar = listObstacle[0];
}

/*Chạm hướng từ dưới lên*/
function collideNorth(ball, collidePoint) {
    const dy = ball.dy;
    if (dy > 0) return false;

    const distance = distanceCollideNorth(ball, collidePoint);
    return 0 >= distance && distance > dy
}

/*chạm hướng từ trên xuống*/
function collideSouth(ball, collidePoint) {
    const dy = ball.dy;
    if (dy < 0) return false;

    const distance = distanceCollideSouth(ball, collidePoint);
    return 0 <= distance && distance < dy
}

/*Chạm hướng từ trái qua phải*/
function collideEast(ball, collidePoint) {
    const dx = ball.dx;
    if (dx < 0) return false;
    const distance = distanceCollideEast(ball, collidePoint);
    return 0 <= distance && distance < dx
}

/*Chạm hướng từ phải qua trái*/
function collideWest(ball, collidePoint) {
    const dx = ball.dx;
    if (dx > 0) return false;
    const distance = distanceCollideWest(ball, collidePoint);
    return 0 <= distance && distance < Math.abs(dx)
}

/*Kiểm tra xem quả banh có chạm vào cc phần tử khác có trong map không*/
function checkCollide(listBall, ball, listObstacle, screenWidth, screenHeight, level) {
    const dx = ball.dx;
    const dy = ball.dy;
    const isCollideWall = collideWall(ball, screenWidth, screenHeight);
    if (isCollideWall === TouchDirection.SOUTH) return TouchDirection.NONE
    if (isCollideWall !== TouchDirection.NONE) {
        if (level >= 4) ball.setColor(colors[Math.floor(Math.random() * colors.length)])
        return isCollideWall;
    }
    let result = TouchDirection.NONE;
    for (let index in listStone) {
        result = listStone[index].collide(ball, dx, dy);
        if (result !== TouchDirection.NONE) {
            if (level >= 4) ball.setColor(colors[Math.floor(Math.random() * colors.length)])
            return result
        }
    }

    for (let index = 0; index < listObstacle.length; index++) {
        result = listObstacle[index].collide(ball, dx, dy);

        if (result === TouchDirection.NONE) continue;
        score += 10 * level;
        setScore(score);
        const obstacle = listObstacle[index];
        if (!isNaN(obstacle.blood)) {
            if (level === 3)
                obstacle.setBlood(obstacle.blood - 1)
            if (level >= 4 && ball.color === obstacle.color)
                obstacle.setBlood(obstacle.blood)

            obstacle.drawBlood(contentCanvas);
        }


        if ((level >= 4 && ball.color === obstacle.color) || level < 4)
            if (isNaN(obstacle.blood) || obstacle.blood === 0) {
                const item = obstacle.getItem();
                if (item) listItem.push(item)
                obstacle.drawXY(-100000, -100000, contentCanvas);
                removeElement(listObstacle, index)
                return result;
            }

        if (level >= 4) ball.setColor(colors[Math.floor(Math.random() * colors.length)])
        return result;
    }

    return TouchDirection.NONE
}


/*Tính khoảng cách từ chái banh đến điểm chạm từ dưới lên trêni*/
function distanceCollideNorth(ball, collidePoint) {
    return collidePoint - (ball.y - ball.radius);
}

/*Tính khoảng cách từ chái banh đến điểm chạm từ trên xuống dưới*/
function distanceCollideSouth(ball, collidePoint) {
    return collidePoint - (ball.y + ball.radius);
}

/*Tính khoảng cách từ chái banh đến điểm chạm từ phải sang trái*/
function distanceCollideWest(ball, collidePoint) {
    return (ball.x - ball.radius) - collidePoint;
}

/*Tính khoảng cách từ chái banh đến điểm chạm từ trái sang phải*/
function distanceCollideEast(ball, collidePoint) {
    return collidePoint - (ball.x + ball.radius);
}

/*Kiểm tra banh có chạm viên gạch theo hướng trên xuống dưới*/
function collideSouthObstacle(ball, bar) {
    const dy = ball.dy;
    const collidePoint = bar.y;
    if ((ball.x + ball.radius) >= (bar.x - ball.radius) && (ball.x - ball.radius) <= (bar.x + bar.width + ball.radius)) return collideSouth(ball, collidePoint, dy);
    return false
}

/*Kiểm tra banh có chạm viên gạch theo hướng dưới lên trên*/
function collideNorthObstacle(ball, bar) {
    const dy = ball.dy;
    const collidePoint = bar.y + bar.height;
    if ((ball.x + ball.radius) >= (bar.x - ball.radius) && (ball.x - ball.radius) <= (bar.x + bar.width + ball.radius)) return collideNorth(ball, collidePoint, dy);
    return false;
}

/*Kiểm tra banh có chạm viên gạch theo hướng phải sang trái*/
function collideWestObstacle(ball, bar) {
    const dx = ball.dx;
    const collidePoint = bar.x + bar.width;

    if ((ball.y + ball.radius) >= (bar.y - ball.radius) && (ball.y - ball.radius) <= (bar.y + bar.height + ball.radius)) return collideWest(ball, collidePoint, dx);
    return false
}

/*Kiểm tra banh có chạm viên gạch theo hướng trái sang phải*/
function collideEastObstacle(ball, bar) {
    const dx = ball.dx;
    const collidePoint = bar.x;

    if ((ball.y + ball.radius) >= (bar.y - ball.radius) && (ball.y - ball.radius) <= (bar.y + bar.height + ball.radius)) return collideEast(ball, collidePoint, dx);
    return false
}

/*Thay đổi góc bay*/
function randomAngle(speed) {
    let angle = Math.floor(Math.random() * 90) + 1;
    const dx = Math.cos(angle * Math.PI / 180) * speed
    const dy = Math.sin(angle * Math.PI / 180) * speed
    return [dx, dy];
}

/*Sự kiện duy chuyển thanh bar*/
const moveBar = (bar, clientX, screenWidth, contentCanvas) => {
    const barWidth = bar.width;
    const barY = bar.y;
    let barX = bar.x;

    barX = clientX - bar.width / 2;
    if (barX >= (screenWidth - barWidth)) barX = screenWidth - barWidth
    if (barX < 0) barX = 0;

    bar.drawXY(barX, barY, contentCanvas);
}

/*Khóa phần tử khỏi mảng*/
function removeElement(list, index) {
    return list.splice(index, 1)
}

/*Vẽ lại các đối tượng đang duy chuyển*/
function drawElements(listBall, listItem, contentCanvas) {
    listBall.map(ball => {
        ball.clearDraw(contentCanvas)
    })

    listBall.map(ball => {
        ball.drawXY(ball.x + ball.dx, ball.y + ball.dy, contentCanvas);
    })

    let newListItem = listItem;
    listItem.map((item, index) => {
        item.drop(contentCanvas);
        if (item.collide()) {
            playSoundEffect(SOUND.SOUND_EFFECT_EAT_ITEM);
            item.reward.action()
            item.drawXY(-1000, -1000, contentCanvas);
            newListItem = removeElement(newListItem, index)
        } else if (item.width === 0 || item.y > screenHeight) newListItem = removeElement(newListItem, index)
    });
    listItem = newListItem;
}

/*Kểm tra chạm tường*/
function collideWall(ball, screenWidth, screenHeight) {
    if (collideEast(ball, screenWidth)) return TouchDirection.EAST
    if (collideWest(ball, 0)) return TouchDirection.WEST
    if (collideSouth(ball, screenHeight)) return TouchDirection.SOUTH
    if (collideNorth(ball, 0)) return TouchDirection.NORTH
    return TouchDirection.NONE;
}

/*Khởi tạo danh sách các viên gạch*/
const createArrayObstacleWithRows = (listObs, rows) => {
    let w = 75;
    const obstacleWidth = w, obstacleHeight = 40;
    const columns = Math.floor(screenWidth / obstacleWidth);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const y = row * obstacleHeight + 2.5 * (row + 1);
            const x = col * obstacleWidth + 2.5 * (col + 1);
            const obs = new Obstacle(x, y, obstacleWidth, obstacleHeight);
            listObs.push(obs);
        }
    }
}

/*Vẽ các viên gạch trong danh sách trướng ngại vậy*/
const drawObstacle = (listObs, contentCanvas) => {
    listObs.map(obs => {
        if (obs instanceof Obstacle) {
            obs.draw(contentCanvas);
        }
    });
}

/*Khởi tạo class hình tròn*/
class Circle {
    constructor(x, y, radius) {
        const rndPoint = randomAngle(speed);
        this.setDxy(Math.random() <= 0.5 ? rndPoint[0] : -rndPoint[0], -rndPoint[1]);
        this.setPoint(x, y);
        this.radius = radius;
        this.setColor(undefined);
    }

    draw = (contentCanvas) => {
        contentCanvas.beginPath();
        contentCanvas.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        contentCanvas.fillStyle = this.color
        contentCanvas.fill();
        contentCanvas.closePath();
    }

    drawXY(x, y, contentCanvas) {
        // this.clearDraw(contentCanvas);
        this.setPoint(x, y);
        this.draw(contentCanvas);
    }

    clearDraw(contentCanvas) {
        contentCanvas.clearRect(this.x - this.radius - 0.5, this.y - this.radius - 0.5, this.radius * 2 + 1, this.radius * 2 + 1);
    }

    setColor(color) {
        this.color = color ? color : "#e11919";
    }

    setPoint = (x, y) => {
        this.x = x;
        this.y = y;
    }

    setDxy(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }

}

/*Khởi tạo class hình chử nhật*/
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.setColor(undefined);
    }


    draw(contentCanvas) {
        contentCanvas.beginPath();
        contentCanvas.rect(this.x, this.y, this.width, this.height);
        contentCanvas.fillStyle = this.color
        contentCanvas.fill();
        contentCanvas.closePath();
    }

    drawXY(x, y, contentCanvas) {
        contentCanvas.clearRect(this.x - 1, this.y, this.width + 2, this.height);
        this.setPoint(x, y);
        this.draw(contentCanvas);
    }

    setPoint(x, y) {
        this.x = x;
        this.y = y;
    }

    setColor(color) {
        this.color = color ? color : "#e11919";
    }

    collide(ball, dx, dy) {
        if (collideSouthObstacle(ball, this)) return TouchDirection.SOUTH
        if (collideNorthObstacle(ball, this)) return TouchDirection.NORTH
        if (collideEastObstacle(ball, this)) return TouchDirection.EAST
        if (collideWestObstacle(ball, this)) return TouchDirection.WEST
        return TouchDirection.NONE;
    }
}

/*Khởi tạo class viên gạch*/
class Obstacle extends Rectangle {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.setColor("#0b4689")
        this.border = 15
    }

    setBlood(blood) {
        this.blood = blood;
    }


    collide(ball, dx, dy) {
        const result = super.collide(ball, dx, dy);
        if (result === TouchDirection.NONE) return result

        if (this.color === ball.color && this.blood !== 0) {
            this.blood--;
        }

        return result;
    }

    draw = (contentCanvas) => {
        contentCanvas.fillStyle = this.color
        contentCanvas.beginPath();
        contentCanvas.arc(this.x + this.border, this.y + this.border, this.border, 0, Math.PI * 2);
        contentCanvas.fill();
        contentCanvas.closePath()
        contentCanvas.beginPath();
        contentCanvas.arc(this.x + this.width - this.border, this.y + this.border, this.border, 0, Math.PI * 2);
        contentCanvas.fill();
        contentCanvas.closePath()
        contentCanvas.beginPath();
        contentCanvas.arc(this.x + this.border, this.y + this.height - this.border, this.border, 0, Math.PI * 2);
        contentCanvas.fill();
        contentCanvas.closePath()
        contentCanvas.beginPath();
        contentCanvas.arc(this.x + this.width - this.border, this.y + this.height - this.border, this.border, 0, Math.PI * 2);
        contentCanvas.fill();
        contentCanvas.closePath()
        contentCanvas.beginPath();
        contentCanvas.rect(this.x, this.y + this.border, this.width, this.height - this.border * 2);
        contentCanvas.fill();
        contentCanvas.closePath()
        contentCanvas.beginPath();
        contentCanvas.rect(this.x + this.border, this.y, this.width - this.border * 2, this.height);
        contentCanvas.fill();
        contentCanvas.closePath()
        contentCanvas.beginPath()
        contentCanvas.rect(this.x, this.y, this.width, this.height);
        contentCanvas.strokeStyle = "#fff";
        contentCanvas.stroke();
        this.drawBlood(contentCanvas);
        contentCanvas.closePath();
    }

    drawXY = (x, y, contentCanvas) => {
        contentCanvas.clearRect(this.x, this.y, this.width, this.height);
        this.setPoint(x, y);
        this.draw(contentCanvas);
    }

    drawBlood(contentCanvas) {
        if (this.blood && this.blood !== 0) {
            const circle = new Circle(this.x + this.width / 2, this.y + this.height / 2, 10);
            circle.setColor("#fff")
            circle.draw(contentCanvas);
            contentCanvas.fillStyle = "#000"
            contentCanvas.fillText(this.blood < 10 ? "0" + this.blood : this.blood, this.x + this.width / 2 - 6, this.y + this.height / 2 + 3);
        }
    }

    getItem() {
        if (Math.random() <= 0.2) return new Item(this.x, this.y, this.width, this.height);
    }
}

/*Khởi tạo class vật phẩm*/
class Item extends Rectangle {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        const indexReward = Math.floor(Math.random() * REWARD.length);
        this.setReward(REWARD[indexReward])
    }

    setReward(reward) {
        this.reward = reward;
        this.setColor(this.reward.color)
    }

    draw = (contentCanvas) => {
        super.draw(contentCanvas);
        contentCanvas.beginPath();
        contentCanvas.rect(this.x, this.y, this.width, this.height);
        contentCanvas.strokeStyle = " #fff";
        contentCanvas.stroke();
        this.drawRewardName(contentCanvas);
        contentCanvas.closePath();
    }


    /*Phần thưởng rớt xuống*/
    drop = (contentCanvas) => {
        this.drawXY(this.x, this.y + 3, contentCanvas)
    }

    /* Vẽ tên phần thưởng */
    drawRewardName(contentCanvas) {
        const circle = new Circle(this.x + this.width / 2, this.y + this.height / 2, 12);
        circle.setColor("#fff")
        circle.draw(contentCanvas);
        contentCanvas.font = "15px serif";
        contentCanvas.fillStyle = "#000"
        contentCanvas.fillText(this.reward.name, this.x + this.width / 2 - 8, this.y + this.height / 2 + 3, 7000);
    }

    /*Kiểm tra va chạm */
    collide() {
        return this.y + this.height >= bar.y && this.y <= bar.y + bar.height && this.x + this.width >= bar.x && this.x <= bar.x + bar.width
    }
}

/*Lớp abstract của việc sử lý xự kiện*/
class Reward {
    constructor(name) {
        this.name = name;
    }

    action() {
    }
}

/*Tạo lớp xử lý hành vi tăng gấp đôi*/
class RewardX2 extends Reward {
    constructor() {
        super("x2");
        this.color = "#0df11f"
    }

    action() {
        let ball;
        const count = listBall.length * 2;
        for (let i = 0; i < count; i++) {
            ball = new Circle(bar.x + bar.width / 2, ballY - ballSize, ballSize);
            ball.draw(contentCanvas);
            listBall.push(ball);
        }
    }
}

/*Tạo lớp xử lý hành vi giảm số bóng đi một nữa*/
class RewardDivide2 extends Reward {
    constructor() {
        super("÷5");
        this.color = "#fd0202"
    }

    action() {
        if (listBall.length === 1) return;
        let ball;
        let count = parseInt(listBall.length / 2);
        let newListBall = listBall;
        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * newListBall.length);
            ball = newListBall[index];
            ball.clearDraw(contentCanvas)
            ball.drawXY(1000, 1000, contentCanvas)
            newListBall = removeElement(newListBall, index)
            ball.clearDraw(contentCanvas)
        }

        listBall = newListBall
    }
}

/*Tạo lớp xử lý hành vi giảm 5 quá bóng*/
class RewardDecrease5 extends Reward {

    constructor() {
        super("-5");
        this.color = "#de1179"
    }

    action() {
        if (listBall.length === 1) return;
        let ball;
        let count = Math.min(listBall.length, 5);
        let newListBall = listBall;
        for (let i = 0; i < count; i++) {
            const index = Math.floor(Math.random() * newListBall.length);
            ball = newListBall[index];
            ball.clearDraw(contentCanvas)
            ball.drawXY(1000, 1000, contentCanvas)
            newListBall = removeElement(newListBall, index)
            ball.clearDraw(contentCanvas)
        }

        listBall = newListBall
    }
}

/*Tạo lớp xử lý hành vi tăng 5 quá bóng*/
class RewardIncrease5 extends Reward {

    constructor() {
        super("+5");
        this.color = "#3cf4c3"
    }

    action() {
        let ball;
        for (let i = 0; i < 5; i++) {
            ball = new Circle(ballX, ballY - ballSize, ballSize);
            ball.draw(contentCanvas);
            listBall.push(ball);
        }

    }
}

class RewardReverse extends Reward {

    constructor() {
        super("⮂ ");
        this.color = "#bbf400"
    }

    action() {
        reverse = -1;
        let interval;
        setTimeout(() => {
            reverse = 1
            clearInterval(interval);
            interval = null
        }, 3800)

        setTimeout(() => {
            let change = true;
            let color = bar.color;
            interval = setInterval(() => {
                if (!change) bar.setColor(color)
                else bar.setColor("#f89b9b")

                change = !change;
            }, 200)
        }, 2000);
    }
}

class RewardUpSeed extends Reward {

    constructor() {
        super(" ↗ ");
        this.color = "#e899ff"
    }

    action() {
        upSpeed = 3;
        let interval;
        setTimeout(() => {
            upSpeed = 1;
            clearInterval(interval);
            interval = null
        }, 3800)

        setTimeout(() => {
            let change = true;
            let color = bar.color;
            interval = setInterval(() => {
                if (!change) bar.setColor(color)
                else bar.setColor("#f89b9b")

                change = !change;
            }, 200)
        }, 2000);
    }
}


const REWARD = [new RewardX2(), new RewardDivide2(), new RewardIncrease5(), new RewardDecrease5(), new RewardReverse(), new RewardUpSeed()];

/*Tạo sự kiện theo level 1*/
const level1 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, rows);
    drawObstacle(listObstacle, contentCanvas);
}

/*Tạo dự kiện level 2*/
const level2 = (listObstacle, contentCanvas) => {
    level1(listObstacle, contentCanvas);
    dropObstacle(listObstacle, contentCanvas);
}

/*Tạo dự kiện level 3*/
const level3 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, rows)
    listObstacle.map(obs => {
        if (obs instanceof Obstacle) {
            const blood = Math.floor(Math.random() * 5);
            obs.setBlood(blood === 0 ? 1 : blood);
        }
    })
    drawObstacle(listObstacle, contentCanvas)
    dropObstacle(listObstacle, contentCanvas);
}

/*Tạo dự kiện level 4*/
const level4 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, rows)
    listObstacle.map(obs => {
        if (obs instanceof Obstacle) {
            obs.setColor(colors[Math.floor(Math.random() * colors.length)])
        }
    });
    drawObstacle(listObstacle, contentCanvas)
    dropObstacle(listObstacle, contentCanvas);
}

/*Tạo dự kiện level 5*/
const level5 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, rows)
    listObstacle.map(obs => {
        if (obs instanceof Obstacle) {
            obs.setColor(colors[Math.floor(Math.random() * colors.length)])
            const blood = Math.floor(Math.random() * 5);
            obs.setBlood(blood === 0 ? 1 : blood);
        }
    });
    drawObstacle(listObstacle, contentCanvas)
    // dropObstacle(listObstacle, contentCanvas);
}

/*Tạo dự kiện level 5*/
const level6 = (listObstacle, contentCanvas) => {
    level5(listObstacle, contentCanvas)

    wallLeft = new Rectangle(0, screenHeight / 2 - 5, screenWidth / 2 - 50, 10)
    wallRight = new Rectangle(screenWidth / 2 + 50, screenHeight / 2 - 5, screenWidth / 2 - 50, 10)
    wallLeft.draw(contentCanvas)
    wallRight.draw(contentCanvas)
    listStone.push(wallLeft)
    listStone.push(wallRight)
}

const moveWall = (dx) => {
    if (level !== 6) return
    if (wallLeft.width === 0 || wallLeft.width === screenWidth - 100) dx = -dx
    wallLeft.width = wallLeft.width - dx;
    wallLeft.drawXY(wallLeft.x, wallLeft.y, contentCanvas);
    wallRight.width = wallRight.width + dx;
    wallRight.drawXY(wallRight.x - dx, wallRight.y, contentCanvas);

    if (run && !pause) requestAnimationFrame(() => {
        moveWall(dx)
    })
}

/*Tọa sự kiện drop*/
const dropObstacle = (listObstacle, contentCanvas) => {
    setInterval(() => {
        if (run && !pause) {
            listObstacle.map(obs => {
                if (obs instanceof Obstacle) {
                    contentCanvas.clearRect(obs.x, obs.y, obs.width, obs.height);
                    obs.setPoint(obs.x, obs.y + 5);
                }
            });

            drawObstacle(listObstacle, contentCanvas);
        }
    }, 5000);
}
const drawObstacleByLevel = (level, listObs, contentCanvas) => {
    switch (level) {
        case 1: {
            level1(listObs, contentCanvas)
            break;
        }
        case 2: {
            level2(listObs, contentCanvas);
            break;
        }
        case 3: {
            level3(listObs, contentCanvas);
            break;
        }
        case 4: {
            level4(listObs, contentCanvas);
            break;
        }
        case 5: {
            level5(listObs, contentCanvas);
            break;
        }
        case 6: {
            level6(listObs, contentCanvas);
            break;
        }
    }
}