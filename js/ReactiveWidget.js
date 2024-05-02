export default function ReactiveWidget(target, { showValue = () => {}, value } = {}) {
  // 🧰 The interval value selected by the user interaction
  let intervalValue = value;

  // 🧰 And a function to update the current internal value. This one triggers the input event
  function setValue(newValue) {
    intervalValue = newValue;
    showValue();
    target.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }

  // 🧰 The value attribute setter and getter
  Object.defineProperty(target, "value", {
    get() {
      return intervalValue;
    },
    set(newValue) {
      intervalValue = newValue;
      showValue();
    },
  });

  // 🧰 Listen to the input event, and reflec the current value
  target.addEventListener("input", showValue);

  // Expose the setValue
  target.setValue = setValue;

  // 🧰 Finally return the html element
  return target;
}