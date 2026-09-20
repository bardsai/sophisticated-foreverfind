import { Easing, FadeIn, FadeInDown } from 'react-native-reanimated';

// A single smooth deceleration curve, reused everywhere so entrance motion
// reads as one deliberate, restrained gesture rather than a bouncy spring.
const EASE_OUT = Easing.out(Easing.cubic);

export function entranceAnimation(delay = 0) {
  return FadeInDown.duration(450).delay(delay).easing(EASE_OUT);
}

export function fadeInAnimation() {
  return FadeIn.duration(220).easing(EASE_OUT);
}
