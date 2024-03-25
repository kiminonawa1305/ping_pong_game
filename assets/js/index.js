const screenWidth = (window.innerWidth - 18);
const screenHeight = window.innerHeight - 18;

const soundEffectCollide = $('#sound_effect_collide')[0];

const canvas = $("#board_game");
canvas.attr("width", screenWidth);
canvas.attr("height", screenHeight);

const contentCanvas = canvas[0].getContext("2d");

const speed = 10;

const barWidth = 200, barHeight = 10, spaseBarCompareToScreen = 50,
    barX = screenWidth / 2 - barWidth / 2,
    barY = screenHeight - barHeight - spaseBarCompareToScreen, ballSize = 10;

const rndPoint = randomAngle(speed, speed, speed);

let ballX = barX + barWidth / 2, ballY = barY - ballSize, dx = Math.random() > 0.5 ? -rndPoint[0] : rndPoint[0],
    dy = rndPoint[1], run = false;

let isMoveBar = false;
let start = true;
let level = 5;

const colors = ["#e11919", "#0b4689", "#000", "#036a0c", "#ab02b5", "#5b014a"];

$(document).ready(() => {
    const ball = new Circle(ballX, barY - ballSize, ballSize),
        bar = new Rectangle(barX, barY, barWidth, barHeight);

    const listObs = [bar];

    ball.draw(contentCanvas)
    bar.draw(contentCanvas);
    const draw = () => {
        if (!run) return;

        let huong = TouchDirection.NONE;
        /*Xử lý va chạm tường*/
        while ((huong = checkCollide(ball, listObs, dx, dy, level)) !== TouchDirection.NONE) {
            if (level === 4) {
                ball.setColor(colors[Math.floor(Math.random() * colors.length)]);
            }

            if (huong === TouchDirection.WEST || huong === TouchDirection.EAST) {
                getCollisionSound();
                const rdPoint = randomAngle(dx, dy, speed);
                dx = rdPoint[0]
                // dy = Math.random() > 0.5 ? -rdPoint[1] : rdPoint[1]
                dy = rdPoint[1]
            }

            if (huong === TouchDirection.SOUTH || huong === TouchDirection.NORTH) {
                getCollisionSound();
                const rdPoint = randomAngle(dy, dx, speed);
                dy = rdPoint[0]
                // dx = Math.random() > 0.5 ? -rdPoint[1] : rdPoint[1]
                dx = rdPoint[1]
            }
        }

        ballX += dx;
        ballY += dy

        ball.drawXY(ballX, ballY, contentCanvas);
        bar.draw(contentCanvas);
    }

    /*event move bar and start game*/
    canvas.mousedown(event => {
        isMoveBar = true;
        if (start) {
            start = false;
            run = true;
            draw();
        }
    });

    canvas.mouseup(event => {
        isMoveBar = false;
    });

    canvas.mousemove(event => {
        if (isMoveBar && run) {
            moveBar(bar, event.clientX, screenWidth, contentCanvas);
        }
    });

    setInterval(draw, 20)
    mapLevel(level, listObs, contentCanvas, bar);
});

/*Chạm hướng từ dưới lên*/
function collideNorth(ball, collidePoint, dy) {
    if (dy > 0) return false;

    const distance = distanceCollideNorth(ball, collidePoint);
    return 0 >= distance && distance > dy
}

/*chạm hướng từ trên xuống*/
function collideSouth(ball, collidePoint, dy) {
    if (dy < 0) return false;

    const distance = distanceCollideSouth(ball, collidePoint);
    return 0 <= distance && distance < dy
}

/*Chạm hướng từ trái qua phải*/
function collideEast(ball, collidePoint, dx) {
    if (dx < 0) return false;
    const distance = distanceCollideEast(ball, collidePoint);
    return 0 <= distance && distance < dx
}

/*Kiểm tra xem quả banh có chạm vào cc phần tử khác có trong map không*/
function checkCollide(ball, list, dx, dy, level) {
    const isCollideWall = collideWall(ball, dx, dy);
    if (isCollideWall !== TouchDirection.NONE) return isCollideWall;
    let result = TouchDirection.NONE;
    for (let index = 0; index < list.length; index++) {
        result = list[index].collide(ball, dx, dy);

        if (result === TouchDirection.NONE)
            continue;

        if (level >= 4 && list[index].color !== ball.color) {
            ball.setColor(colors[Math.floor(Math.random() * colors.length)]);
            return result;
        }

        if (list[index] instanceof Obstacle) {
            if (isNaN(list[index].blood) || list[index].blood === 0) {
                contentCanvas.clearRect(list[index].x, list[index].y, list[index].width, list[index].height);
                list[index].setPoint(-100000, -100000);
                list[index].width = 0;
                list[index].height = 0;
                list[index].draw(contentCanvas);
            }

            if (list[index].blood > 0) {
                list[index].drawBlood(contentCanvas);
            }
        }

        return result;
    }

    return TouchDirection.NONE
}

/*Chạm hướng từ phải qua trái*/
function collideWest(ball, collidePoint, dx) {
    if (dx > 0) return false;
    const distance = distanceCollideWest(ball, collidePoint);
    return 0 >= distance && distance > dx
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
function collideSouthObstacle(ball, bar, dy) {
    const collidePoint = bar.y;
    if ((ball.x + ball.radius) >= (bar.x - ball.radius) && (ball.x - ball.radius) <= (bar.x + bar.width + ball.radius))
        return collideSouth(ball, collidePoint, dy);
    return false
}

/*Kiểm tra banh có chạm viên gạch theo hướng dưới lên trên*/
function collideNorthObstacle(ball, bar, dy) {
    const collidePoint = bar.y + bar.height;
    if ((ball.x + ball.radius) >= (bar.x - ball.radius) && (ball.x - ball.radius) <= (bar.x + bar.width + ball.radius))
        return collideNorth(ball, collidePoint, dy);
    return false;
}

/*Kiểm tra banh có chạm viên gạch theo hướng phải sang trái*/
function collideWestObstacle(ball, bar, dx) {
    const collidePoint = bar.x + bar.width;

    if ((ball.y + ball.radius) >= (bar.y - ball.radius) && (ball.y - ball.radius) <= (bar.y + bar.height + ball.radius))
        return collideWest(ball, collidePoint, dx);
    return false
}

/*Kiểm tra banh có chạm viên gạch theo hướng trái sang phải*/
function collideEastObstacle(ball, bar, dx) {
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
    affect = affect > 0 ? speed * 2 - rdInverseNumber : rdInverseNumber - speed * 2

    return [inverseNumber, affect];
}

/*Sự kiện duy chuyển thanh bar*/
const moveBar = (bar, clientX, screenWidth, contentCanvas) => {
    const barWidth = bar.width;
    const barHeight = bar.height;
    const barY = bar.y;
    let barX = bar.x;

    barX = clientX - bar.width / 2;
    if (barX >= (screenWidth - barWidth)) barX = screenWidth - barWidth
    if (barX < 0) barX = 0;

    bar.drawXY(barX, barY, contentCanvas);
}

/*Kểm tra chạm tường*/
function collideWall(ball, dx, dy) {
    if (collideEast(ball, screenWidth, dx)) return TouchDirection.EAST
    if (collideWest(ball, 0, dx)) return TouchDirection.WEST
    if (collideNorth(ball, 0, dy)) return TouchDirection.NORTH
    if (collideSouth(ball, screenHeight, dy)) return TouchDirection.SOUTH
    return TouchDirection.NONE;
}

/*Khởi tạo danh sách các viên gạch*/
const createArrayObstacleWithRows = (listObs, rows) => {
    let w = 50;
    for (; w < 100; w++) {
        if ((screenWidth - w * Math.floor(screenWidth / w)) <= 5) break;
    }

    const obstacleWidth = w, obstacleHeight = 30;
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
        this.setPoint(x, y);
        this.radius = radius;
        this.setColor(undefined);
    }

    draw = (contentCanvas) => {
        contentCanvas.beginPath();
        contentCanvas.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        contentCanvas.fillStyle = this.color
        contentCanvas.fill();
    }

    drawXY = (x, y, contentCanvas) => {
        contentCanvas.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        this.setPoint(x, y);
        contentCanvas.beginPath();
        contentCanvas.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        contentCanvas.fillStyle = this.color
        contentCanvas.fill();
    }

    setColor(color) {
        this.color = color ? color : "#e11919";
    }

    setPoint = (x, y) => {
        this.x = x;
        this.y = y;
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
    }

    drawXY(x, y, contentCanvas) {
        contentCanvas.clearRect(this.x, this.y, this.width, this.height);
        this.setPoint(x, y);
        contentCanvas.beginPath();
        contentCanvas.rect(this.x, this.y, this.width, this.height);
        contentCanvas.fillStyle = this.color
        contentCanvas.fill();
    }

    setPoint(x, y) {
        this.x = x;
        this.y = y;
    }

    setColor(color) {
        this.color = color ? color : "#e11919";
    }

    collide(ball, dx, dy) {
        if (collideSouthObstacle(ball, this, dy)) return TouchDirection.SOUTH
        if (collideNorthObstacle(ball, this, dy)) return TouchDirection.NORTH
        if (collideEastObstacle(ball, this, dx)) return TouchDirection.EAST
        if (collideWestObstacle(ball, this, dx)) return TouchDirection.WEST
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
        contentCanvas.strokeStyle = "#fff";
        contentCanvas.stroke();
        this.drawBlood(contentCanvas);
    }

    drawXY = (x, y, contentCanvas) => {
        contentCanvas.clearRect(this.x, this.y, this.width, this.height);
        super.drawXY(x, y, contentCanvas);
        contentCanvas.strokeStyle = "#fff";
        contentCanvas.stroke();
        this.drawBlood(contentCanvas);
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
}

/*Tạo âm thanh va chạm*/
function getCollisionSound() {
    soundEffectCollide.pause();
    soundEffectCollide.currentTime = 0;
    soundEffectCollide.play()
}

/*Tạo kết quả khi banh đụng tường*/
const TouchDirection = {"EAST": 1, "WEST": 2, "SOUTH": 3, "NORTH": 4, "NONE": 0}

/*Tạo sự kiện theo level*/
const level1 = (listObstacle, contentCanvas) => {
    const rows = 10;
    createArrayObstacleWithRows(listObstacle, rows);
    drawObstacle(listObstacle, contentCanvas);
}

const level2 = (listObstacle, contentCanvas) => {
    level1(listObstacle, contentCanvas);
    dropObstacle(listObstacle, contentCanvas);
}

const level3 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, 10)
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
    createArrayObstacleWithRows(listObstacle, 10)
    listObstacle.map(obs => {
        if (obs instanceof Obstacle) {
            obs.setColor(colors[Math.floor(Math.random() * colors.length)])
        }
    });
    drawObstacle(listObstacle, contentCanvas)
    dropObstacle(listObstacle, contentCanvas);
}

const level5 = (listObstacle, contentCanvas) => {
    createArrayObstacleWithRows(listObstacle, 10)
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
        if (run) {
            listObstacle.map(obs => {
                if (obs instanceof Obstacle) {
                    contentCanvas.clearRect(obs.x, obs.y, obs.width, obs.height);
                    obs.setPoint(obs.x, obs.y + 5);
                }
            });

            drawObstacle(listObstacle, contentCanvas);
        }
    }, 10000);
}
const mapLevel = (level, listObs, contentCanvas) => {
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
