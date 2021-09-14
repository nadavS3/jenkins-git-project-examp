import citiesDB from '../consts/citiesDB'

export const compareCityToDataBase = (city) => {
  for (let i = 0; i < citiesDB.length; i++) {
    if (city === citiesDB[i]) { return true; }
  }
  return false;
}

export const isOverlapping = (newAnswer, otherAnswer) => {
  if (newAnswer.left > otherAnswer.right || newAnswer.right < otherAnswer.left) {
    return false;
  }
  if (newAnswer.top > otherAnswer.bottom || newAnswer.bottom < otherAnswer.top) {
    return false;
  }
  return true;
}

const userAgent = navigator.userAgent.toLowerCase();
export const myIsTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
