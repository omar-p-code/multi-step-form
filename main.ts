const form = document.getElementById('form') as HTMLFormElement;
const sideBar = document.getElementById('sidebar') as HTMLDivElement;
let currentStep = 'step-1';
let billing: 'monthly' | 'yearly' = (sessionStorage.getItem('billing') as 'monthly' | 'yearly') || 'yearly';

let per = {
   monthly: 'month',
   yearly: 'year'
}

let userData: any = retrieveSession('userData') || {
   name: '',
   email: '',
   phone: ''
}

let prices = {
   arcade: {monthly: '$9/mo', yearly: '$90/yr'},
   advanced: {monthly: '$12/mo', yearly: '$120/yr'},
   pro: {monthly: '$15/mo', yearly: '$150/yr'},
   'online service': {monthly: '$1/mo', yearly: '$10/yr'},
   'larger storage': {monthly: '$2/mo', yearly: '$20/yr'},
   'customizable profile': {monthly: '$2/mo', yearly: '$20/yr'},
}

let summary: any = retrieveSession('summary') || {
   plan: 'arcade',
   addOnes: ["Online Service", "Larger Storage"],
}

if (sessionStorage.getItem('currentStep')) {
   currentStep = sessionStorage.getItem('currentStep') as string;
   clickActive(currentStep);
}


handleFormData(form, fetchData(), currentStep);

Array.from(sideBar.children).forEach((child):void => {
   let step = child as HTMLDivElement;
   step.addEventListener('click', stepClickHandler.bind(null, step));
});

function stepClickHandler(step: HTMLElement) {
      let stepId = step.id;
      if (checkHandler() == false) {
         return;
      }

      if (!CheckInputs(form)) {
         return;
      }

      if (stepId === currentStep) {
         return;
      }
      removeActive();
      step.classList.add('active');
      handleFormData(form, fetchData(), stepId);
      currentStep = stepId;
      form.className = currentStep;
      sessionStorage.setItem('currentStep', currentStep);
}

function removeActive() {
   Array.from(sideBar.children).forEach((child): void => {
      let step = child as HTMLDivElement;
      step.classList.remove('active');
   });
}

function fetchData(): any {
   return fetch("form.json")
   .then(response => response.json())
}

function handleFormData(form: HTMLFormElement, data: any, step: string) {
   data.then((data: any) => {
      let stepData = data[step];
      form.innerHTML = ''; // Clear existing fields
      addHeader(stepData.title, stepData.description, form);
      handleSteps(step, stepData);
      addFooter(form, step);
   });
}

function addFooter(form: HTMLFormElement, step: string) {
   let footer = create('div', {class: 'form-footer'});
   if (step !== 'step-1') {
      const goBack = create('button', {type: 'button'}, 'Go Back', 'form-back');
      goBack.addEventListener('click', goBackHandler);
      footer.appendChild(goBack);
   }

   if (step === 'step-4') {
      let confirm = create('button', {type: 'submit'}, 'Confirm', 'form-submit');
      confirm.addEventListener('click', confirmHandler);
      footer.appendChild(confirm);
   }else {
      const next = create('button', {type: 'button'}, 'Next', 'form-next');
      next.addEventListener('click', nextHandler);
      footer.appendChild(next);
   }
   form.appendChild(footer);
}

function confirmHandler(e: MouseEvent) {
   form.innerHTML = '';
   e.preventDefault();
   addStep5(form);
}

function goBackHandler() {
   const match = currentStep.match(/\d$/);
   currentStep = `step-${match ? Number(match[0]) - 1 : 1}`;
   handleFormData(form, fetchData(), currentStep);
   clickActive(currentStep);
   sessionStorage.setItem('currentStep', currentStep);
}

function nextHandler() {
   if (checkHandler() == false) {
      return;
   }
   if (!CheckInputs(form)) {
      return;
   }
   const match = currentStep.match(/\d$/);
   currentStep = `step-${match ? Number(match[0]) + 1 : 2}`;
   handleFormData(form, fetchData(), currentStep);
   clickActive(currentStep);
   sessionStorage.setItem('currentStep', currentStep);
}

function checkHandler() {
   if (currentStep === 'step-1') {
      if (checkForm().some(checksSome)) {
         setIntRemClass(form, 'error-message');
         return false;
      }
      return true;
   }
}

function checksSome(check: {error: boolean}) {
   return check.error;
}

function clickActive(id: string) {
   removeActive();
   document.getElementById(id)?.classList.add('active');
   form.className = currentStep;
}

function handleSteps(step:string, stepData: any) {
      if (step === 'step-1') {
         addStep1(stepData.fields, form);
      } else if (step === 'step-2') {
         addStep2(stepData.fields, form);
      } else if (step === 'step-3') {
         addStep3(stepData.fields, form);
      } else {
         addStep4(form);
      }
}

function addHeader(title: string, description: string, form: HTMLFormElement) {
   let header = create('div', {}, '', 'form-header');
   header.appendChild(create('h1', {}, title, 'form-title'));
   header.appendChild(create('p', {}, description, 'form-description'));
   form.appendChild(header);
}

function addStep1(fields: any, form: HTMLFormElement) {
      if (fields) { 
         Object.keys(fields).forEach((field: any)=> {
         let formGroup = create('div', {}, '', 'form-group');
         let input = create(fields[field].type, fields[field].attr);
         formGroup.appendChild(create('label', {for: field}, fields[field].label, 'form-label'));
         fillInputs(input as HTMLInputElement);
         input.addEventListener('input', recordInput.bind(null, input as HTMLInputElement))
         formGroup.appendChild(input);
         form.appendChild(formGroup);
      });
   }
}

function recordInput(input: HTMLInputElement) {
   if (input.id === 'name') {
      userData.name = input.value;
   } else if (input.id === 'email') {
      userData.email = input.value;
   } else {
      userData.phone = input.value;
   }
   saveSession();
   input.parentElement?.classList.remove('invalid-message');
   input.parentElement?.classList.remove('error-message');
}

function fillInputs(input: HTMLInputElement) {
   if (input.id === 'name') {
      input.value = userData.name;
   }else if (input.id === 'email') {
      input.value = userData.email;
   }else {
      input.value = userData.phone;
   }
}


function addStep2(fields: any, form: HTMLFormElement) {
   if (fields) {
         let options = create('div', {class: 'options-container'});
         addPlanOptions(fields['plan'].options, options);
         form.appendChild(options);
         addBiilingOption(form);
   }
}

function addStep3(fields: any, form: HTMLFormElement) {
   if (fields) {
      let options = create('div', {class: 'options-container'});
      addAddOnsOptions(fields['add-ons'].options, options);
      form.appendChild(options);
   }
}

function addStep4(form: HTMLFormElement) {
      let summaryEl = create('div', {class: 'summary'});
      let addOnes = create('div', {class: 'summary-addOnes'});
      let summaryTotal = create('div', {class: 'summary-total'});
      let total = create('div', {class: 'total'}, `Total (per ${per[billing]})`,'summary-total-label');
      let totalPrice = create('div', {class: 'total-price'}, getTotalPrice(), 'summary-total-price');
      summaryTotal.appendChild(total);
      summaryTotal.appendChild(totalPrice);

      summary.addOnes.forEach((addOne: any) => {
         let addOnEl = create('div', {class: 'addOnes'});
         let name = create('span', {}, addOne, 'addOnes-name');
         let price = create('span', {}, getPrice(addOne), 'addOnes-price');
         addOnEl.appendChild(name);
         addOnEl.appendChild(price);
         addOnes.appendChild(addOnEl);
      });
      let summaryPlan = create('div', {class: 'summary-plan'});
      let plan = create('div', {class: 'plan'});
      let planName = create('div', {class: 'name'}, `${summary.plan}(${billing.replace(/^y/,'Y').replace(/^m/,'M')})`)
      plan.appendChild(planName);
      let change = create('div', {class: 'change'}, 'Change');

      change.addEventListener('click', () => {
         currentStep = 'step-2';
         handleFormData(form, fetchData(), currentStep);
         clickActive(currentStep);
         sessionStorage.setItem('currentStep', currentStep);
      });

      plan.appendChild(change);
      summaryPlan.appendChild(plan);
      summaryPlan.appendChild(create('div', {class: 'summary-price'}, getPrice(summary.plan)));

      summaryEl.appendChild(summaryPlan);
      summaryEl.appendChild(addOnes);
      form.appendChild(summaryEl);
      form.appendChild(summaryTotal);
}

function addStep5(form: HTMLFormElement) {
   let thank = create('div', {class: 'thank-you'});
   let icon = create('img', {src: 'assets/images/icon-thank-you.svg', alt: 'Thank You Icon'}, '', 'thank-you-icon');
   form.classList.remove(currentStep);
   form.classList.add('step-5');
   thank.appendChild(icon);
   thank.appendChild(create('h1', {}, 'Thank You!', 'thank-you-title'));
   thank.appendChild(create('p', {}, 'Thanks for confirming your subsription! We hope you have fun using our platform. if you ever need support, please feel free to email us at support@loremgaming.com', 'thank-you-message'));
   form.appendChild(thank);
}

function getTotalPrice() {
   let total = 0;
   total += parseFloat(getPrice(summary.plan).replace(/[^0-9]+/g,""));
   summary.addOnes.forEach((addOn: string) => {
      total += parseFloat(getPrice(addOn).replace(/[^0-9]+/g,""));
   });
   return billing === 'monthly' ? `$${total}/mo` : `$${(total).toFixed(0)}/yr`;
}

function getPrice(plan: string): any {
   return prices[plan.toLowerCase() as keyof typeof prices][billing as 'monthly' | 'yearly'];
}

function setIntRemClass(element: HTMLElement, className: string) {
   setTimeout(() => {
         element.querySelectorAll(`.${className}`).forEach((el) => {
            (el as HTMLElement).classList.remove(className);
         });
   }, 5000)
}

function CheckInputs(form: HTMLFormElement) {
   let isValid = true;
   if (currentStep == 'step-1') {
      let name = form.querySelector('input#name') as HTMLInputElement;
      let email = form.querySelector('input#email') as HTMLInputElement;
      let phone = form.querySelector('input#phone') as HTMLInputElement;
      let nameReg = /^[a-zA-Z\s]+$/;
      let emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let phoneReg = /^\+?[0-9\s]+$/;
      let inputs = [{input: name,reg: nameReg}, {input: email, reg: emailReg}, {input: phone, reg: phoneReg}];
      inputs.forEach(({input, reg}) => {
         if (!input.value.match(reg)) {
            input.parentElement?.classList.add('invalid-message');
            isValid = false;
            setIntRemClass(form, 'invalid-message');
         } else {
            userData.name = name.value;
            userData.email = email.value;
            userData.phone = phone.value;
            saveSession();
         }
      });
   }
   return isValid;
}

function addAddOnsOptions(options: any, container: HTMLElement) {
   options.forEach((option: any, index: number) => {
      let id = `option-${index}`;
      let optionElement = create('div', {class: 'option'});
      let checkbox = create('input', {type: 'checkbox', id: id, name: option.name});
      let label = create('label', {for: id},'', 'option-label');
      let title = create('h4', {}, option.title, 'option-title');
      let description = create('p', {}, option.description, 'option-description');
      let price = create('span', {}, option.price[billing], 'option-price');
      label.appendChild(title);
      label.appendChild(description);
      optionElement.addEventListener('click', addOnsClickHandler);

      if (summary.addOnes.includes(option.title)) { 
         optionElement.classList.add('checked');

      }
      
      optionElement.appendChild(checkbox);
      optionElement.appendChild(label);
      optionElement.appendChild(price);
      container.appendChild(optionElement);
   });
}

function addOnsClickHandler(e: MouseEvent) {
   e.stopPropagation();
   let target = e.currentTarget as HTMLElement;
   if (target.classList.contains('option')) {
      target.classList.toggle('checked');
   }
   summary.addOnes = [];
   let options = document.querySelectorAll('.option');
   options.forEach((option: any) => {
      if (option.classList.contains('checked')) {
         let title = option.querySelector('.option-title')?.textContent || '';
         summary.addOnes.push(title);
      }
   });
   saveSession();
   
}

function stopPropagations(e: MouseEvent) {
   e.stopPropagation();
}

function addPlanOptions(options: any, container: HTMLElement) {
   options.forEach((option: any) => {
      let optionElement = create('div', {class: 'option', id: option.title.toLowerCase()});
      let iconContainer = create('div', {class: 'icon-container'});
      let icon = create('img', {src: option.icon, alt: `${option.title} icon`}, '', 'option-icon');
      iconContainer.appendChild(icon);
      optionElement.appendChild(iconContainer);
      optionElement.appendChild(create('h4', {class: 'option-title'}, option.title));
      optionElement.appendChild(create('span', {}, option.price[billing], 'option-price'));
      optionElement.addEventListener('click', planOptionHandler);
      addSelected(optionElement, {one: option.title, two: summary.plan});
      container.appendChild(optionElement);
   });
}

function addSelected(option: HTMLElement, compare: {one: string, two: string}) {
   if (compare.one.toLocaleLowerCase() == compare.two.toLocaleLowerCase()) {
      option.classList.add('selected');
      summary.plan = option.querySelector('.option-title')?.textContent || '';
   }
}

function planOptionHandler (e: MouseEvent) {
   let target = e.currentTarget as HTMLElement;
   if (!target.classList.contains('selected')) {
      Array.from(target.parentElement?.children || []).forEach((child: any) => {
         child.classList.remove('selected');
      });
      target.classList.add('selected');
      summary.plan = target.querySelector('.option-title')?.textContent;
      saveSession();
   }
}

function checkForm(): any {
   let checks: Array<{name: string, error: boolean}> = [];
   form.querySelectorAll('input').forEach((input: HTMLInputElement) => {
      if (input.value === '') {
         input.parentElement?.classList.add('error-message');
         checks.push({name: input.name, error: true});
      }else {
         // input.classList.remove('error-message');
         checks.push({name: input.name, error: false});
      }
   });
   return checks;
}

function saveSession() {
   sessionStorage.setItem('summary', JSON.stringify(summary));
   sessionStorage.setItem('billing', billing);
   sessionStorage.setItem('userData', JSON.stringify(userData));
} 

function retrieveSession(sessionKey: string): any {
   const sessionData = sessionStorage.getItem(sessionKey);
   return sessionData ? JSON.parse(sessionData) : null;
}

function addBiilingOption(container: HTMLElement) {
   let billingOption = create('div', {class: 'billing-option'});
   let monthlyOption = create('span', {class: 'monthly-option'}, "monthly");
   let yearlyOption = create('span', {class: 'yearly-option'}, "yearly");
   let billingToggle = create('div', {class: 'billing-toggle'});
   if (billing === 'monthly') {
      billingOption.classList.add('monthly');
   }
   billingOption.appendChild(monthlyOption);
   billingOption.appendChild(billingToggle);
   billingOption.appendChild(yearlyOption);
   container.appendChild(billingOption);
   billingToggle.addEventListener('click', () => {
      billing = billing === 'yearly' ? 'monthly' : 'yearly';
      billingOption.classList.toggle('monthly');
      handleFormData(form, fetchData(), currentStep);
      saveSession();
   });
}

function create(type: string, attr: {[key: string]: string }, content?: string, className: string = ''): HTMLElement {
   let element = document.createElement(type);
   element.className = className;
   if (content) {
      element.textContent = content;
   }
   for (let key in attr) {
      element.setAttribute(key, attr[key]);
   }
   return element;
}