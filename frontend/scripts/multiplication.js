
const cardContainer = document.querySelector('.multi');

for (let i = 1; i < 10; i++) {
  cardContainer.innerHTML += multiCardHTML(i);
}

function multiCardHTML (num) {
  rawHTML = `<div class="card"><div class="num-container"><span class="number-title">${num}</span>`;
  for (let i = 1; i < 10; i++) {
    rawHTML += `<span>${num} x ${i} = ${num * i}</span>`;
  }

  rawHTML += '</div></div>';
  return rawHTML;

} 