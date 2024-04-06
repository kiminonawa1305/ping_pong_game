/*
* Name: Nguyễn Đình Lam
* ID student: 21130416
* Class: DH21DTC
* Phone number: 0855354919
*/

const screenWidth = /*(window.innerWidth - 18)*/ 750;
const screenHeight = window.innerHeight - 18;

const soundEffectCollide = $('#sound_effect_collide')[0];

let canvas;
let contentCanvas;

const speed = 10;

const barWidth = 150, barHeight = 10, spaseBarCompareToScreen = 50,
    barX = screenWidth / 2 - barWidth / 2,
    barY = screenHeight - barHeight - spaseBarCompareToScreen, ballSize = 10;

const ballX = barX + barWidth / 2, ballY = barY;

let isMoveBar = false;
let start = true;
let level = 1;
let run;
let listBall = [];
let listObstacle = [];
let listItem = [];
const colors = ["#e11919", "#0b4689", "#000", "#036a0c", "#ab02b5", "#5b014a"];
let bar;
let score = 0;
let pause = false;
const rows = 5;
let REWARD
$(document).ready(() => {
    const buttonContinueGame = $('.continue-game')
    $('.new-game').on("click", function () {
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
    });

    $(".next-game").on("click", function (event) {
        if (level <= 6) {
            level++
            newGame();
            clearDataGame();
            buttonContinueGame.hide()
            $(".main-menu").css({'transform': 'translateX(100%)'});
            $("main").css({'transform': 'translateX(0%)'});
            $(".right-menu").css({'transform': 'translateX(0%)'});
        }
    })

    $('.introduce-game').on('click', function (event) {
        $("#introduce").css({"transition": "30s linear", "transform": "translateY(-200%)"})
        setTimeout(() => {
            $("#introduce").css({"transition": "0ms linear", "transform": "translateY(0%)"})
        }, 30 * 1000)
    });

    REWARD = [new RewardX2(), new RewardIncrease5(), new RewardDecrease5(), new RewardDivide2()];

    if (!localStorage.getItem("bar")) buttonContinueGame.hide()

    buttonContinueGame.on("click", function (event) {
        loadDataGame()
        clearDataGame()
        continueGame()
    })
});


$(document).on("keydown", function (event) {
    switch (event.keyCode) {
        case 27: {
            if (!pause && !start) {
                pause = true;
                if (confirm("Bạn có muốn tiếp tục trò chơi không\nNhấn \"OK\" để tiếp tục trò chơi")) {
                    setUpFrameCountDown();
                    countDown();
                } else
                    quitGame();
            }
            break;
        }
    }
});

$("body").on("click", function (event) {
    if ($(event.target).parents('.introduce-game')[0] !== $(".introduce-game")[0])
        $("#introduce").css({"transition": "0ms linear", "transform": "translateY(0%)"})
});


const createBroadGame = () => {
    $("#board_game").html(`<canvas id="canvas"></canvas>`)
    canvas = $("#canvas");

    canvas.attr("width", screenWidth);
    canvas.attr("height", screenHeight);

    contentCanvas = canvas[0].getContext("2d");

    /*event move bar and start game*/
    canvas.mousedown(event => {
        isMoveBar = true;
        if (start) {
            start = false;
            setUpFrameCountDown();
            countDown();
        }

        if (pause) {
            pause = false;
            countDown();
        }
    });

    canvas.mouseup(event => {
        isMoveBar = false;
    });

    canvas.mousemove(function (event) {
        const elementX = this.getBoundingClientRect().x;
        if (isMoveBar && run) {
            moveBar(bar, event.clientX - elementX, screenWidth, contentCanvas);
        }
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


const newGame = () => {
    run = false;
    pause = false;
    start = true;

    createBroadGame();

    listBall = [];
    listObstacle = []
    listItem = [];
    bar = new Rectangle(barX, barY, barWidth, barHeight);
    const ball = new Circle(ballX, ballY - ballSize, ballSize);
    ball.draw(contentCanvas);
    listBall.push(ball);

    listObstacle.push(bar);
    bar.draw(contentCanvas);

    drawObstacleByLevel(level, listObstacle, contentCanvas);
}

const playGame = () => {
    let newListBall = listBall;
    for (const index in listBall) {
        if (listObstacle.length === 1) {
            if (confirm(`Chúc mừng bạn đã chiến thắng level ${level}\nNhấn "OK" để tiếp tục chơi level ${++level}`)) {
                createBroadGame()
                newGame();
            } else
                quitGame()
            return;
        }

        const ball = listBall.at(index);
        let huong = TouchDirection.NONE;
        let dx = ball.dx;
        let dy = ball.dy;
        /*Xử lý va chạm tường*/
        while ((huong = checkCollide(listBall, ball, listObstacle, screenWidth, screenHeight, level)) !== TouchDirection.NONE) {
            if (level === 4)
                ball.setColor(colors[Math.floor(Math.random() * colors.length)]);

            if (huong === TouchDirection.WEST || huong === TouchDirection.EAST) {
                getCollisionSound();
                const rdPoint = randomAngle(dx, dy, speed);
                dx = rdPoint[0]
                dy = rdPoint[1]
                // dy = Math.random() > 0.5 ? -rdPoint[1] : rdPoint[1]
                ball.setDxy(dx, dy);
            }

            if (huong === TouchDirection.SOUTH || huong === TouchDirection.NORTH) {
                getCollisionSound();
                const rdPoint = randomAngle(dy, dx, speed);
                dy = rdPoint[0]
                dx = rdPoint[1]
                // dx = Math.random() > 0.5 ? -rdPoint[1] : rdPoint[1]
                ball.setDxy(dx, dy);
            }
        }

        if (ball.y - ball.radius > screenHeight) removeElement(newListBall, index)
    }

    drawElements(listBall, listItem, contentCanvas);

    listBall = newListBall;
    bar.draw(contentCanvas);

    if (!pause && run && listBall.length !== 0)
        requestAnimationFrame(playGame);

    if (listBall.length === 0) {
        if (confirm("Thua mất rồi!\nBạn có muốn chơi lại không?")) {
            level = 1;
            score = 0;
            createBroadGame()
            newGame();
            setScore(score);
        } else {
            quitGame();
        }
    }
}

const quitGame = () => {
    start = true;
    run = false;
    pause = false;
    $(".right-menu").css({'transform': 'translateX(-120%)'});
    setTimeout(() => {
        $("main").css({'transform': 'translateX(-110%)'});
        $(".main-menu").css({'transform': 'translateX(0)'});
    }, 500);
}

const continueGame = () => {
    setScore(score)
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

const clearDataGame = () => {
    localStorage.removeItem("balls", listBall);
    localStorage.removeItem("bar", bar);
    localStorage.removeItem("items", listItem);
    localStorage.removeItem("obstacle", listObstacle)
    localStorage.removeItem("score", score)
    $('.continue-game').hide()

}
const saveDataGame = () => {
    localStorage.setItem("items", JSON.stringify(listItem));
    localStorage.setItem("balls", JSON.stringify(listBall));
    localStorage.setItem("obstacle", JSON.stringify(listObstacle))
    localStorage.setItem("score", score)
}

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
    if (isCollideWall !== TouchDirection.NONE) return isCollideWall;
    let result = TouchDirection.NONE;
    for (let index = 0; index < listObstacle.length; index++) {
        result = listObstacle[index].collide(ball, dx, dy);

        if (result === TouchDirection.NONE)
            continue;

        if (level >= 4 && listObstacle[index].color !== ball.color) {
            ball.setColor(colors[Math.floor(Math.random() * colors.length)]);
            return result;
        }

        if (listObstacle[index] instanceof Obstacle) {
            score += 10 * level;
            setScore(score);
            const obstacle = listObstacle[index];
            if (level === 3) listObstacle[index].setBlood(obstacle.blood - 1)
            if (isNaN(obstacle.blood) || obstacle.blood === 0) {
                const item = obstacle.getItem();
                if (item)
                    listItem.push(item)
                obstacle.drawXY(-100000, -100000, contentCanvas);
                listObstacle = removeElement(listObstacle, index);
                return result;
            }

            if (obstacle.blood > 0) {
                obstacle.drawBlood(contentCanvas);
            }
        }


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
    if ((ball.x + ball.radius) >= (bar.x - ball.radius) && (ball.x - ball.radius) <= (bar.x + bar.width + ball.radius))
        return collideSouth(ball, collidePoint, dy);
    return false
}

/*Kiểm tra banh có chạm viên gạch theo hướng dưới lên trên*/
function collideNorthObstacle(ball, bar) {
    const dy = ball.dy;
    const collidePoint = bar.y + bar.height;
    if ((ball.x + ball.radius) >= (bar.x - ball.radius) && (ball.x - ball.radius) <= (bar.x + bar.width + ball.radius))
        return collideNorth(ball, collidePoint, dy);
    return false;
}

/*Kiểm tra banh có chạm viên gạch theo hướng phải sang trái*/
function collideWestObstacle(ball, bar) {
    const dx = ball.dx;
    const collidePoint = bar.x + bar.width;

    if ((ball.y + ball.radius) >= (bar.y - ball.radius) && (ball.y - ball.radius) <= (bar.y + bar.height + ball.radius))
        return collideWest(ball, collidePoint, dx);
    return false
}

/*Kiểm tra banh có chạm viên gạch theo hướng trái sang phải*/
function collideEastObstacle(ball, bar) {
    const dx = ball.dx;
    const collidePoint = bar.x;

    if ((ball.y + ball.radius) >= (bar.y - ball.radius) && (ball.y - ball.radius) <= (bar.y + bar.height + ball.radius))
        return collideEast(ball, collidePoint, dx);
    return false
}

/*Thay đổi góc bay*/
function randomAngle(inverseNumber, affect, speed) {
    let rdInverseNumber = inverseNumber;
    while (Math.abs(rdInverseNumber) === Math.abs(inverseNumber)) {
        rdInverseNumber = Math.floor(Math.random() * speed) + 1;
    }

    rdInverseNumber = rdInverseNumber === 0 ? 1 : rdInverseNumber > speed ? speed : rdInverseNumber;

    inverseNumber = inverseNumber > 0 ? -rdInverseNumber : rdInverseNumber;
    affect = affect > 0 ? speed - rdInverseNumber : rdInverseNumber - speed

    return [inverseNumber, affect];
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

function removeElement(list, index) {
    return list.splice(index, 1)
}

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
            const y = row * obstacleHeight;
            const x = col * obstacleWidth;
            const obs = new Obstacle(x, y, obstacleWidth, obstacleHeight);
            listObs[(row * columns) + col + 1] = obs;
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
        const rndPoint = randomAngle(speed, speed, speed);
        const dx = Math.random() > 0.5 ? -rndPoint[0] : rndPoint[0],
            dy = -rndPoint[1];
        this.setDxy(dx, dy);
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
        contentCanvas.beginPath();
        contentCanvas.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        contentCanvas.closePath();
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
    }

    setBlood(blood) {
        this.blood = blood;
    }


    collide(ball, dx, dy) {
        const result = super.collide(ball, dx, dy);
        if (result !== TouchDirection.NONE && this.color === ball.color && this.blood !== 0) {
            this.blood--;
        }

        return result;
    }

    draw = (contentCanvas) => {
        super.draw(contentCanvas);
        contentCanvas.beginPath();
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
        if (Math.random() <= 0.2)
            return new Item(this.x, this.y, this.width, this.height);
    }
}

/*Khởi tạo class vật phẩm*/
class Item extends Rectangle {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.setColor("#fde440")
        const indexReward = Math.floor(Math.random() * REWARD.length);
        this.setReward(REWARD[indexReward])
    }

    setReward(reward) {
        this.reward = reward;
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

    drawXY = (x, y, contentCanvas) => {
        contentCanvas.clearRect(this.x, this.y, this.width, this.height);
        this.setPoint(x, y + 3);
        this.draw(contentCanvas);
    }

    drop = (contentCanvas) => {
        this.drawXY(this.x, this.y, contentCanvas)
    }

    drawRewardName(contentCanvas) {
        const circle = new Circle(this.x + this.width / 2, this.y + this.height / 2, 10);
        circle.setColor("#fff")
        circle.draw(contentCanvas);
        contentCanvas.fillStyle = "#000"
        contentCanvas.fillText(this.reward.name, this.x + this.width / 2 - 6, this.y + this.height / 2 + 3);
    }

    collide() {
        return this.y + this.height >= bar.y && this.y <= bar.y + bar.height && this.x + this.width >= bar.x && this.x <= bar.x + bar.width
    }
}

class Reward {
    constructor(name) {
        this.name = name;
    }

    action() {
    }
}

class RewardX2 extends Reward {
    constructor() {
        super("x2");
    }

    action() {
        let ball;
        const count = listBall.length * 2;
        for (let i = 0; i < count; i++) {
            ball = new Circle(ballX, ballY - ballSize, ballSize);
            ball.draw(contentCanvas);
            listBall.push(ball);
        }
    }
}

class RewardDivide2 extends Reward {
    constructor() {
        super("÷5");
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

class RewardDecrease5 extends Reward {

    constructor() {
        super("-5");
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

class RewardIncrease5 extends Reward {

    constructor() {
        super("+5");
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

/*Tạo âm thanh va chạm*/
function getCollisionSound() {
    soundEffectCollide.pause();
    soundEffectCollide.currentTime = 0;
    soundEffectCollide.play()
}

/*Tạo kết quả khi banh đụng tường*/
const TouchDirection = {"EAST": 1, "WEST": 2, "SOUTH": 3, "NORTH": 4, "NONE": 0, "REMOVE": -1}

/*Tạo sự kiện theo level*/
const level1 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, rows);
    drawObstacle(listObstacle, contentCanvas);
}

const level2 = (listObstacle, contentCanvas) => {
    level1(listObstacle, contentCanvas);
    dropObstacle(listObstacle, contentCanvas);
}

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
    }
}