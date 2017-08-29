class Form {


    /**
     На странице должна быть задана html-форма с id="myForm", внутри которой содержатся
     a. инпуты
     - ФИО (name="fio"),
     - Email (name="email"),
     - Телефон (name="phone");
     b. кнопка отправки формы (id="submitButton").
     А также должен быть задан div-контейнер с id="resultContainer" для вывода результата работы формы.
     */
    constructor() {
        this._fields = ['fio', 'phone', 'email'];
        this.form = document.getElementById("myForm");
        this.resultContainer = document.querySelector("#resultContainer");
        this.fio = this.form.querySelector('input[name="fio"]');
        this.phone = this.form.querySelector('input[name="phone"]');
        this.email = this.form.querySelector('input[name="email"]');
        this.submitButton = this.form.querySelector('#submitButton');
        this.form.addEventListener('submit', e => {
            e.preventDefault();
            this.submit();
            return false
        })
    }

    /**
     * Email: Формат email-адреса, но только в доменах ya.ru, yandex.ru, yandex.ua, yandex.by, yandex.kz, yandex.com.
     * @returns {boolean}
     * @private
     */
    _validate_email() {

        // It's time to stop using drugs
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(ya\.ru|yandex\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$/;
        return re.test(this.email.value)
    }

    /**
     * ФИО: Ровно три слова.
     * @returns {boolean}
     * @private
     */
    _validate_fio() {
        // Я использую трим, чтобы определить действительно ли здесь три слова, чтобы не зависеть от пробелов,
        // но getData отдает значения без trim. Это неправильное поведение.
        return this.fio.value.trim().split(' ').length === 3;
    }

    /**
     * Телефон: Номер телефона, который начинается на +7, и имеет формат +7(999)999-99-99. Кроме того, сумма всех цифр
     * телефона не должна превышать 30. Например, для +7(111)222-33-11 сумма равняется 24, а для +7(222)444-55-66 сумма равняется 47.
     * @returns {boolean}
     * @private
     */
    _validate_phone() {
        let phone = this.phone.value;
        let re = /^\+[7]\([\d]{3}\)[\d]{3}-[\d]{2}-[\d]{2}$/;
        if (!re.test(phone)) {
            return false;
        }
        return phone.split('').reduce((p, c) => c >= '0' && c <= '9' ? p + parseInt(c) : p, 0) <= 30;
    }

    /**
     * Метод validate возвращает объект с признаком результата валидации (isValid) и массивом названий полей,
     * которые не прошли валидацию (errorFields).
     * @returns {{isValid: boolean, errorFields: Array}}
     */
    validate() {
        let isValid = true;
        let errorFields = [];
        for (let field of this._fields) {
            this[field].classList.remove('error');
            if (this['_validate_' + field]() === false) {
                isValid = false;
                errorFields.push(field);
                this[field].classList.add('error');
            }
        }
        return {
            isValid: isValid,
            errorFields: errorFields
        }
    }

    /**
     * Метод getData возвращает объект с данными формы, где имена свойств совпадают с именами инпутов.
     * @returns {{fio, phone, email}}
     */
    getData() {
        return {
            fio: this.fio.value,
            phone: this.phone.value,
            email: this.email.value
        }
    }

    /**
     * Метод setData принимает объект с данными формы и устанавливает их инпутам формы. Поля кроме phone, fio, email игнорируются.
     * @param obj
     */
    setData(obj) {
        obj.fio ? this.fio.value = obj.fio : this.fio.value = "";
        obj.email ? this.email.value = obj.email : this.email.value = "";
        obj.phone ? this.phone.value = obj.phone : this.phone.value = "";
    }

    /**
     * Возвращает случайный json
     */
    getRandomUrl() {
        return ['./json/error.json', './json/progress.json', './json/success.json'][Math.floor(Math.random() * 3)]

    }

    /**
     * Это хитрая обертка над http-requestom. Так как в тз, не сказано каким методом и с каким content-type отправлять запрос
     * я выбрал самую примитивную отправку get запроса с параметрами. Если я не так все понял, то я очень расстроюсь :(
     */
    doRequest() {
        let data = this.getData(),
            ctrl = this,
            params = Object.keys(data).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');

        ctrl.submitButton.setAttribute('disabled', 'true');
        let httpRequest = () => {
            let url = this.getRandomUrl();
            fetch(`${url}?${params}`).then(
                response => {
                    response.json().then(
                        result => {
                            switch (result.status) {
                                case 'success': {
                                    ctrl.resultContainer.classList.remove('progress');
                                    ctrl.submitButton.removeAttribute('disabled');
                                    ctrl.resultContainer.innerHTML = "Success";
                                    ctrl.resultContainer.classList.add('success');
                                    break;
                                }
                                case 'error': {
                                    ctrl.resultContainer.classList.remove('progress');
                                    ctrl.submitButton.removeAttribute('disabled');
                                    ctrl.resultContainer.innerHTML = result.reason;
                                    ctrl.resultContainer.classList.add('error');
                                    ctrl.submitButton.removeAttribute('disabled');
                                    break;
                                }
                                case 'progress': {
                                    ctrl.resultContainer.classList.add('progress');
                                    setTimeout(httpRequest, result.timeout);
                                    break
                                }
                            }
                        }
                    )


                },
                error => console.log(error)
            );

        };
        httpRequest()
    }

    /**
     * Метод submit выполняет валидацию полей и отправку ajax-запроса, если валидация пройдена.
     * Вызывается по клику на кнопку отправить.
     */
    submit() {
        this.resultContainer.innerHTML = "";
        this.resultContainer.classList.remove('error');
        this.resultContainer.classList.remove('success');
        let valid = this.validate();
        if (valid.isValid === false) return;
        this.doRequest()
    };
}

/**
 * В глобальной области видимости должен быть определен объект MyForm с методами
 validate() => { isValid: Boolean, errorFields: String[] }
 getData() => Object
 setData(Object) => undefined
 submit() => undefined
 * @type {Form}
 */
let MyForm = new Form();
