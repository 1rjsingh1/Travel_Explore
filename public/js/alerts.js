export const showAlert = (type, message) => {
  hideAlert();
  const markup = `<div class = 'alert alert--${type}'>${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(() => hideAlert(), 2000);
};

export const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) {
    ele.parentElement.removeChild(ele);
  }
};
