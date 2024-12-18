document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('add-button');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // 加載任務
    async function loadTasks() {
        const response = await fetch('http://localhost:3000/api/tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    }

    // 渲染任務到頁面
    function renderTasks(tasks) {
        todoList.innerHTML = '';  // 清空現有的任務列表
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="task-text ${task.is_completed ? 'completed' : ''}">${task.description}</span>
                <button class="edit-button" data-id="${task.id}">編輯</button>
                <button class="delete-button" data-id="${task.id}">刪除</button>
                <button class="toggle-button" data-id="${task.id}">${task.is_completed ? '未完成' : '完成'}</button>
            `;
            todoList.appendChild(li);
        });


 // 綁定編輯功能
 document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const taskId = event.target.getAttribute('data-id');
        const taskItem = event.target.closest('li');
        const taskText = taskItem.querySelector('.task-text').textContent;

        editTask(taskId, taskText);
    });
});

function editTask(taskId, currentText) {
    // 顯示一個提示框讓使用者輸入新的內容
    const newText = prompt('請輸入新的任務內容：', currentText);

    if (newText !== null && newText.trim() !== '') {
        // 發送 PUT 請求更新任務內容
        fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newText })
        })
        .then(response => {
            if (response.ok) {
                loadTasks(); // 重新加載任務列表
            } else {
                console.error('更新任務失敗');
                alert('更新任務失敗，請稍後再試');
            }
        })
        .catch(error => {
            console.error('更新任務時出錯:', error);
            alert('更新任務時出錯，請稍後再試');
        });
    } else {
        alert('任務內容不能為空');
    }
}



// 添加刪除功能
document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (event) => {
        const taskId = event.target.getAttribute('data-id');
        try {
            // 發送 DELETE 請求來刪除任務
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, { method: 'DELETE' });
            if (response.ok) {
                loadTasks(); // 重新加載任務
            } else {
                console.error('刪除任務失敗');
            }
        } catch (error) {
            console.error('刪除任務時出錯:', error);
        }
    });
});

// 標記任務完成或未完成
document.querySelectorAll('.toggle-button').forEach(button => {
    button.addEventListener('click', async (event) => {
        const taskId = event.target.getAttribute('data-id'); // 獲取任務 ID
        const taskItem = event.target.closest('li');
        const taskText = taskItem.querySelector('.task-text'); // 找到任務文字的元素
        const isCurrentlyCompleted = taskText.classList.contains('completed');

        try {
            // 計算新的狀態
            const newStatus = isCurrentlyCompleted ? 0 : 1;

            // 發送 PUT 請求來更新任務狀態
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed: newStatus })
            });

            if (response.ok) {
                // 更新前端狀態
                if (newStatus === 1) {
                    taskText.classList.add('completed');
                    event.target.textContent = '未完成';
                } else {
                    taskText.classList.remove('completed');
                    event.target.textContent = '完成';
                }
            } else {
                console.error('Failed to update task status');
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('更新任務狀態失敗，請稍後再試');
        }
    });
});

    }

    // 添加新任務
    addButton.addEventListener('click', async () => {
        const description = todoInput.value.trim();
        if (description) {
            await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            todoInput.value = '';
            loadTasks(); // 重新加載任務
        } else {
            alert('請輸入任務內容');
        }
    });

    // 如果按下回車鍵也能添加任務
    todoInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addButton.click();
        }
    });

    // 初始加載任務
    loadTasks();
});



