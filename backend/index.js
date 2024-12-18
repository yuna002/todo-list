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
    const { description, is_completed } = req.body;

    if (description !== undefined && (!description || description.trim() === '')) {
        return res.status(400).json({ error: '任務描述不能為空' });
    }

    try {
        const completedAt = is_completed !== undefined ? (is_completed ? new Date() : null) : undefined;

        // 更新的 SQL 動態構建
        let query = 'UPDATE tasks SET ';
        const updates = [];
        const values = [];

        if (description !== undefined) {
            updates.push(`description = $${values.length + 1}`);
            values.push(description);
        }

        if (is_completed !== undefined) {
            updates.push(`is_completed = $${values.length + 1}`);
            values.push(is_completed);
            updates.push(`completed_at = $${values.length + 1}`);
            values.push(completedAt);
        }

        query += updates.join(', ');
        query += ` WHERE id = $${values.length + 1} RETURNING *`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: '未找到該任務' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('更新任務時出錯:', error);
        res.status(500).json({ error: '伺服器錯誤' });
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
