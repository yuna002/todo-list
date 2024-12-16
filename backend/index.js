// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// 使用中間件
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL 配置
const pool = new Pool({
    user: 'postgres',        // PostgreSQL 用戶名
    host: 'localhost',       // PostgreSQL 伺服器地址
    database: 'postgres',    // 資料庫名稱
    password: '123456',      // 密碼
    port: 5432,              // PostgreSQL 端口
});

// 測試 API
app.get('/', (req, res) => {
    res.send('TODO List API is running...');
});

// 取得所有任務
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC;');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving tasks');
    }
});

// 創建新的任務
app.post('/api/tasks', async (req, res) => {
    const { description } = req.body;
    try {
        const result = await pool.query('INSERT INTO tasks(description) VALUES($1) RETURNING *', [description]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating task');
    }
});

// 更新任務狀態
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { is_completed } = req.body;

    // 設定 `completed_at` 的值，如果任務完成則為當前時間，否則設為 NULL
    const completedAt = is_completed ? new Date() : null;

    try {
        const result = await pool.query(
            'UPDATE tasks SET is_completed = $1, completed_at = $2 WHERE id = $3 RETURNING *',
            [is_completed, completedAt, id]
        );
        if (result.rows.length === 0) {
            res.status(404).send('Task not found');
        } else {
            res.json(result.rows[0]); // 返回更新後的任務
        }
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Error updating task');
    }
});

// 刪除任務
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting task');
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
