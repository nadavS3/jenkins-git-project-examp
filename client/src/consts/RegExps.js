export const questionInfoRegExp = new RegExp(/^[a-zA-Z0-9\u0590-\u05fe "!`?()'.,\-/\n]+$/);

export const nameRegExp = new RegExp(/^[a-zA-Z\u0590-\u05fe "'-]+$/);

export const cityRegExp = new RegExp(/^[\u0590-\u05fe "()`'-]+$/);

export const emailRegExp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/);

export const phoneNumberRegExp = new RegExp(/^[(]?[0-9]{3}[)]?[-\s]?[0-9]{3}[-\s]?[0-9]{4,6}$/)

export const basicPhoneNumberRegExp = new RegExp(/^[0-9 \-()]+$/)