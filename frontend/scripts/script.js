
const newName = document.querySelector('#button');
newName.addEventListener('click', updateName);

function updateName() {
  let name = prompt('親愛的勇者請輸入您的名字');
  document.getElementById('show').innerHTML ='勇者 '+name+'，歡迎來到我們的世界，這個世界要靠你拯救了!!!';
}

