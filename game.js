class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // プレイヤーや具材の画像をロード
        this.load.image('tacoShell', 'taco.png');
        this.load.image('meat', './meat.png');
        this.load.image('cheese', './cheese.png');
        this.load.image('lettuce', './let.png');
        this.load.image('tomato', './tomato.png');
        this.load.image('chili', './chili.png');
    }

    create() {
        // プレイヤーの作成
        this.player = this.physics.add.sprite(400, 550, 'tacoShell').setCollideWorldBounds(true);
        this.player.setScale(0.25); // 必要に応じてサイズ調整

        // カーソル入力を有効化
        this.cursors = this.input.keyboard.createCursorKeys();

        // スコアとタイマーの初期設定
        this.score = 0;
        this.timeLeft = 30;
        this.gameOver = false;

        // スコアとタイマーのテキストを表示
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        this.timerText = this.add.text(600, 16, 'Time: 30', { fontSize: '32px', fill: '#fff' });

        // 具材のグループを作成
        this.ingredients = this.physics.add.group();

        // プレイヤーと具材の衝突判定
        this.physics.add.collider(this.player, this.ingredients, this.catchIngredient, null, this);

        // 具材を定期的に落とすタイマーイベント
        this.time.addEvent({
            delay: Phaser.Math.Between(500, 1500),
            callback: this.dropIngredient,
            callbackScope: this,
            loop: true
        });

        // タイマーのカウントダウン
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.gameOver) {
            return; // ゲームが終了したら処理を停止
        }

        // プレイヤーの左右移動を管理
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        // プレイヤーのY座標を固定
        this.player.y = 550;
    }

    dropIngredient() {
        const types = ['meat', 'cheese', 'lettuce', 'tomato', 'chili']; // 具材の種類
        const maxIngredients = Phaser.Math.Between(3, 6); // 一度に落とす具材の数をランダムに
        const minSpeed = 100; // 落下速度の最小値
        const maxSpeed = 300; // 落下速度の最大値

        for (let i = 0; i < maxIngredients; i++) {
            const x = Phaser.Math.Between(50, 750); // ランダムなX座標
            const type = Phaser.Math.RND.pick(types); // ランダムに具材を選ぶ
            const ingredient = this.ingredients.create(x, 0, type); // 具材を作成
            ingredient.setScale(0.05); // 必要に応じてサイズ調整
            const speed = Phaser.Math.Between(minSpeed, maxSpeed); // ランダムな落下速度
            ingredient.setVelocityY(speed); // 落下速度を設定
        }
    }

    catchIngredient(player, ingredient) {
        ingredient.disableBody(true, true); // 具材を消す

        // 得点計算
        if (ingredient.texture.key === 'meat') {
            this.score += 10;
        } else if (ingredient.texture.key === 'cheese') {
            this.score += 7;
        } else if (ingredient.texture.key === 'lettuce') {
            this.score += 5;
        } else if (ingredient.texture.key === 'tomato') {
            this.score += 3;
        } else {
            this.score += 15;
        }

        this.scoreText.setText('Score: ' + this.score);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);

        if (this.timeLeft <= 0) {
            this.gameOver = true;
            this.physics.pause(); // ゲーム停止
            this.scene.start('ScoreScene', { score: this.score }); // スコアシーンに移動
        }
    }
}

class ScoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreScene' });
    }

    init(data) {
        this.finalScore = data.score; // ゲームシーンからスコアを受け取る
    }

    create() {
        this.add.text(400, 200, 'Game Over', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 300, 'Your Score: ' + this.finalScore, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // リスタート用のボタンを表示
        let restartButton = this.add.text(400, 400, 'Restart', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('GameScene'); // ゲームシーンを再スタート
            });
    }
}

// Phaserゲーム設定を定義
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene, ScoreScene] // ゲームシーンとスコアシーンを登録
};

const game = new Phaser.Game(config);
