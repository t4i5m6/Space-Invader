'use strict';

//app to draw polymorphic shapes on canvas
let app;

var img = new Image();
img.src = './enemy_3.png'
img.style.background = "black"
var game_status = "home";

class Projectile {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setY(y) {
        this.y= y;
    }
    getLoc(){
        return [this.x, this.y]
    }

}

class Enemy {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setLoc(x, y) {
        this.x = x;
        this.y = y;
    }
    getLoc(){
        return [this.x, this.y]
    }

}

var press_id = new Array(2);
var Projectiles;
var Enemy_Projectiles;
var Enemies;
var PlayerX;
var enemies_num;
var enemy_v;
var total_projectiles;
const PlayerY = 700;
var laserCount = 0;

function createApp(canvas) {
    let c = canvas.getContext("2d");

    let drawHelpButton = function() {
        c.fillStyle = "white"
        c.font = '30px serif';
        c.fillText('Use mouse click to fire the enemies from outer space!', 50, 100);
        c.fillText('Use left arrow and right arrow to move', 50, 200);
        c.fillText('If you continue to hit enemies, something will happen ....', 50, 300);
    }

    let drawLeaderBoard = function() {
        document.getElementById('HelpButton').style.visibility = "hidden";
        c.fillStyle = "white"
        c.font = '60px serif';
        c.fillText('LeaderBoard', 200, 100);
        let score_list = JSON.parse(window.localStorage.getItem('score'))

        c.font = '30px serif';
        c.fillText('Score', 250, 150);
        c.fillText('Time', 400, 150);
        c.fillText('Hit / Bullets', 500, 150);

        for ( let i = 0 ; i < score_list.length ; i++) {
            let sec = Math.floor(score_list[i][1]);
            let min = Math.floor(sec / 60);
            sec %= 60;
            c.fillText(`${i+1}:`, 100, 200 + i * 50);
            c.fillText(`${score_list[i][0]}`, 250, 200 + i * 50);
            c.fillText(`${min}:${sec}`, 400, 200 + i * 50);
            c.fillText(`${score_list[i][2]}/${score_list[i][3]}`, 500, 200 + i * 50);
            c.fillText(`${(score_list[i][2] / score_list[i][3] * 100).toFixed(2)} %`, 600, 200 + i * 50);
        }
    }
    let drawHomePage = function() {
        document.getElementById('HelpButton').style.visibility = "visible";
        total_projectiles = 0;
        Projectiles = new Set();
        Enemy_Projectiles = new Set();
        Enemies = new Set();
        PlayerX = 0;
        for (let i = 30 ;i < 700 ; i += 70) {
            Enemies.add(new Enemy(0+i, 50))
            Enemies.add(new Enemy(0+i, 100))
            Enemies.add(new Enemy(0+i, 150))
            Enemies.add(new Enemy(0+i, 200))
        }
        enemies_num = Enemies.size;
        enemy_projectile_random_range = 17;
        enemy_v = 0.15

        if (window.localStorage.getItem('score')) {
            document.getElementById('RankButton').style.visibility = "visible";
        }

        c.fillStyle = "white"
        c.font = '60px serif';
        c.fillText('Space Invader', 200, 250);
        press_id[0] = setInterval(function (){
            c.font = '30px serif';
            c.fillText('Press Space to Start!', 250, 350);
        }, 1000)
        press_id[1] = setInterval(function (){
            c.clearRect(250,300, 300, 150)
        }, 1600)

        c.font = '20px serif';
        c.fillText('Authored by Tim', 300, 600);
    }


    let drawEndPage = function(duration) {
        c.fillStyle = "white"
        c.font = '60px serif';
        if (Enemies.size === 0) {
            c.fillText('You Win !', 250, 250);
        }
        else {
            c.fillText('You Lose !', 250, 250);
        }
        c.fillText(`Score: ${(enemies_num-Enemies.size) * 20}`, 250, 450);
        c.font = '20px serif';
        c.fillText(`Time: ${duration}s`, 250, 490);
        c.fillText(`Hit/ Bullets: ${(enemies_num-Enemies.size)}/ ${total_projectiles}`, 250, 510);
        c.font = '30px serif';
        c.fillText(`Press space to return`, 250, 650);
    }

    let drawScore = function() {
        c.fillStyle = "white"
        c.font = '30px serif';
        c.fillText(`Score: ${(enemies_num-Enemies.size) * 20}`, 30, 30);
    }

    let drawPlayer = function(startX, startY) {
        c.fillStyle = "white";
        c.beginPath();
        let next_x = startX + 60
        let next_y = startY + PlayerY
        c.moveTo(next_x, next_y);
        next_x += 15
        next_y += 15
        c.lineTo(next_x, next_y);
        next_x += 30
        next_y += 15
        c.lineTo(next_x, next_y);
        next_x -= 90
        c.lineTo(next_x, next_y);
        next_x += 30
        next_y -= 15
        c.lineTo(next_x, next_y);
        next_x = startX + 60
        next_y = startY + PlayerY
        c.lineTo(next_x, next_y);
        c.closePath();
        c.fill();
    };
    let drawLaser = function() {
        if (laserCount === 70 || game_status === "end"){
            clearInterval(laserId);
            continue_hit = 0
            laserCount = 0
            laserId = -1
            return
        }

        laserCount += 1
        let x = 58.5 + PlayerX;
        let y = 0;
        let size = 20
        c.fillStyle = 'white';
        c.beginPath();
        c.moveTo (x + size * Math.cos(0), y + size * Math.sin(0));

        let coordinates = [
            [x + 4, y], [x + 4, y + PlayerY], [x, y + PlayerY], [x,y]
        ];

        for (const coordinate of coordinates ) {
            c.lineTo(coordinate[0], coordinate[1]);
        }

        c.closePath();
        c.fill();
    };

    let drawProjectile = function(x, y, color) {
        let size = 20
        c.fillStyle = color;
        c.beginPath();
        c.moveTo (x + size * Math.cos(0), y + size * Math.sin(0));

        let coordinates = [
            [x + size / 5, y], [x + size / 5, y + size], [x, y + size ], [x,y]
        ];

        for (const coordinate of coordinates ) {
            c.lineTo(coordinate[0], coordinate[1]);
        }

        c.closePath();
        c.fill();
    };

    let drawEnemy = function (x, y) {

        c.drawImage(img, x, y, 50, 50)

    }

    let clear = function() {
        c.clearRect(0,0, canvas.width, canvas.height);
    };

    let getLoc = function() {
        return [canvas.width, canvas.height]
    }

    return {
        getLoc: getLoc,
        drawHelpButton: drawHelpButton,
        drawLaser:drawLaser,
        drawLeaderBoard: drawLeaderBoard,
        drawEnemy: drawEnemy,
        drawProjectile: drawProjectile,
        drawPlayer: drawPlayer,
        drawScore: drawScore,
        drawEndPage: drawEndPage,
        drawHomePage: drawHomePage,
        clear: clear
    }
}

/**
 * Setup event handling for buttons
 */
window.onload = function() {
    app = createApp(document.querySelector("canvas"));
    app.drawHomePage();

    document.addEventListener("keydown", handleKeyDownEvent);
    document.addEventListener("click", handleCickEvent);

    document.getElementById('RankButton').onclick = function () {
        game_status = 'leaderboard';
        clear()
        clearInterval(press_id[0]);
        clearInterval(press_id[1]);
        document.getElementById('BackHomeButton').style.visibility = 'visible';
        document.getElementById('RankButton').style.visibility = 'hidden';
        app.drawLeaderBoard();
    };
    document.getElementById('BackHomeButton').onclick = function () {
        game_status = "home";
        clear();
        app.drawHomePage();
        document.getElementById('BackHomeButton').style.visibility = 'hidden';
    }

    document.getElementById('HelpButton').onclick = function () {
        document.getElementById('BackHomeButton').style.visibility = 'visible';
        document.getElementById('HelpButton').style.visibility = 'hidden';
        game_status = 'help';
        clear();
        clearInterval(press_id[0]);
        clearInterval(press_id[1]);
        app.drawHelpButton();
    }

    setInterval(animate, 0);
};



var v = 1;
var  enemy_projectile_random_range;

var already_end = false;
var start_timer;
var continue_hit = 0;

function animate() {

    if (game_status === "home") {
        return
    }
    else if(game_status === 'leaderboard' || game_status === 'help') {
        return
    }
    else if (game_status === "end") {
        if (!already_end){
            continue_hit = 0
            already_end = true;

            let end_timer = new Date().getTime()
            if (window.localStorage.getItem('score') === null) {
                window.localStorage.setItem('score', JSON.stringify(
                    [[(enemies_num-Enemies.size) * 20, (end_timer-start_timer) / 1000, (enemies_num-Enemies.size), total_projectiles]]));
            }
            else {
                let tmp_list = JSON.parse(window.localStorage.getItem('score'))

                tmp_list.push([(enemies_num-Enemies.size) * 20, (end_timer-start_timer) / 1000, (enemies_num-Enemies.size), total_projectiles])
                tmp_list.sort(function(a, b) {
                    if (a[0] === b[0]) {
                        return a[1] - b[1]
                    }
                    return b[0] - a[0]
                })
                if (tmp_list.length > 5) {
                    tmp_list.pop()
                }
                window.localStorage.setItem('score', JSON.stringify(tmp_list))
            }
            clear()
            app.drawScore();
            app.drawEndPage((end_timer-start_timer) / 1000);
        }
        return
    }
    clear()
    app.drawPlayer(PlayerX, 0);
    app.drawScore();

    let enemy_p;
    if( laserId !== -1){
        for ( const enemy of Enemies) {
            enemy_p = enemy.getLoc()
            if (enemy_p[0] -10 <= PlayerX+58.5 && PlayerX+58.5 <= 50 + enemy_p[0]) {
                Enemies.delete(enemy)
            }
        }
    }


    for (const projectile of Enemy_Projectiles) {
        const point = projectile.getLoc()
        /*
          see if enemy projectile hit the player
         */
        if( PlayerX <= point[0] && point[0] <= PlayerX + 105 && PlayerY-20 <= point[1] && point[1] <= PlayerY-10) {
            game_status = "end";
            return
        }
        app.drawProjectile(point[0], point[1]+v, "white")
        projectile.setY(point[1] + v)
        if (point[1] + v >  800){
            Enemy_Projectiles.delete(projectile)
        }
    }

    for (const projectile of Projectiles) {
        const point = projectile.getLoc()
        let deleted = false;
        for ( const enemy of Enemies) {
            enemy_p = enemy.getLoc()
            if (enemy_p[1] <= point[1]  && point[1] <= 50 + enemy_p[1] && enemy_p[0] -10 <= point[0]
                && point[0] <= 50 + enemy_p[0]) {
                continue_hit += 1
                Enemies.delete(enemy)
                Projectiles.delete(projectile)
                deleted = true;
                break
            }
        }
        if (!deleted){
            app.drawProjectile(point[0], point[1]-v, "white")
            projectile.setY(point[1] - v)
        }
        if (point[1] - v < 0){
            Projectiles.delete(projectile)
            continue_hit = 0
        }
    }

    let enemy_min_x = 100000;
    let enemy_max_x = -1;
    for (const enemy of Enemies) {
        enemy_p = enemy.getLoc()
        /*
         Game End if enemies reach the player
         */
        if ((enemy_p[1] > 250 || Enemies.size <= 7) && enemy_v === 0.15) {
            enemy_v *= 2;
        }
        else if ((enemy_p[1] > 400 || Enemies.size <= 3) && enemy_v === 0.3) {
            enemy_v *= 2;
            if (Enemies.size <= 3){
                enemy_v *= 4;
            }
        }

        if (enemy_p[1] === PlayerY - 40) {
            game_status = "end"
            return
        }
        if( enemy_p[0] < enemy_min_x) {
            enemy_min_x = enemy_p[0]
        }
        if (enemy_p[0] > enemy_max_x) {
            enemy_max_x = enemy_p[0]
        }
    }

    let down = false;
    for (const enemy of Enemies){

        enemy_p = enemy.getLoc()
        app.drawEnemy(enemy_p[0], enemy_p[1]);

        /*
         enemy move down or left
         */
        if (enemy_max_x + enemy_v > app.getLoc()[0] - 100 || enemy_min_x + enemy_v < 10 ) {
            enemy.setLoc(enemy_p[0], enemy_p[1] + 10)
            down = true;
        }
        else if (enemy_p[0] < app.getLoc()[0]) {
            enemy.setLoc(enemy_p[0] + enemy_v, enemy_p[1])
        }
    }
    if (down) {
        enemy_v *= -1
        let r;
        for (const enemy of Enemies) {
            r = Math.floor(Math.random() * enemy_projectile_random_range);
            if ( r === 0) {
                enemy_p = enemy.getLoc()
                Enemy_Projectiles.add(new Projectile(enemy_p[0] + 10, enemy_p[1]))
            }

        }
        if (enemy_projectile_random_range > 5) {
            enemy_projectile_random_range -= 1
        }
    }

    if (Enemies.size === 0) {
        game_status = "end"
    }

}

var laserId = -1;
function handleCickEvent(e){
    if (game_status === "start" && laserId === -1){
        if (continue_hit >= 5){
            laserId = setInterval(app.drawLaser, 0);
        }
        else if( Projectiles.size < 3) {
            Projectiles.add(new Projectile(PlayerX + 58.5, PlayerY - 20))
            total_projectiles += 1;
        }
    }
}

function handleKeyDownEvent(e){
    if ( game_status === "home" && e.key === " ") {
        game_status = "start";
        document.getElementById('RankButton').style.visibility = 'hidden';
        document.getElementById('HelpButton').style.visibility = 'hidden';
        clearInterval(press_id[0]);
        clearInterval(press_id[1])
        start_timer = new Date().getTime();
    }
    else if (game_status === "home") {
        return
    }
    else if(game_status === "end" && e.key === " ") {
        already_end = false;
        game_status = "home";
        clear();
        app.drawHomePage();
    }

    if (e.key === "ArrowLeft"  && PlayerX >= 20){
        PlayerX -= 20;
    }
    else if (e.key === "ArrowRight" && PlayerX <= app.getLoc()[0]- 100){
        PlayerX += 20;
    }


}


/**
 * Clear the canvas
 */
function clear() {
    app.clear();
}