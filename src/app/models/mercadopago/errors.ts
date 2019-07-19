export const errorsInfo = {
  '205': {
    'code': '205',
    'field': 'cardNumber',
    'reason': 'parameter cardNumber can not be null/empty',
    'message': 'Ingresa el número de tu tarjeta'
  },
  '208': {
    'code': '208',
    'field': 'cardExpirationMonth',
    'reason': 'parameter cardExpirationMonth can not be null/empty',
    'message': 'Elige un mes'
  },
  '209': {
    'code': '209',
    'field': 'cardExpirationYear',
    'reason': 'parameter cardExpirationYear can not be null/empty', 'message': 'Elige un año'
  },
  '212': {
    'code': '212',
    'field': 'docType',
    'reason': 'parameter docType can not be null/empty',
    'message': 'Ingresa tu documento'
  },
  '213': {
    'code': '213',
    'field': 'docNumber',
    'reason': 'The parameter cardholder.document.subtype can not be null or empty',
    'message': 'Ingresa tu documento'
  },
  '214': {
    'code': '214',
    'field': 'docNumber',
    'reason': 'parameter docNumber can not be null/empty',
    'message': 'Ingresa tu documento'
  },
  '220': {
    'code': '220',
    'field': 'cardIssuerId',
    'reason': 'parameter cardIssuerId can not be null/empty',
    'message': 'Ingresa tu banco emisor'
  },
  '221': {
    'code': '221',
    'field': 'cardholderName',
    'reason': 'parameter cardholderName can not be null/empty',
    'message': 'Ingresa el nombre y apellido'
  },
  '224': {
    'code': '224',
    'field': 'securityCode',
    'reason': 'parameter securityCode can not be null/empty',
    'message': 'Ingresa el código de seguridad'
  },
  'E301': {
    'code': 'E301',
    'field': 'cardNumber',
    'reason': 'invalid parameter cardNumber',
    'message': 'Hay algo mal en ese número. Vuelve a ingresarlo'
  },
  'E302': {
    'code': 'E302',
    'field': 'securityCode',
    'reason': 'invalid parameter securityCode',
    'message': 'Revisa el código de seguridad'
  },
  '316': {
    'code': '316',
    'field': 'cardholderName',
    'reason': 'invalid parameter cardholderName',
    'message': 'Ingresa un nombre válido'
  },
  '322': {
    'code': '322',
    'field': 'docType',
    'reason': 'invalid parameter docType',
    'message': 'Revisa tu documento'
  },
  '323': {
    'code': '323',
    'field': 'docNumber',
    'reason': 'invalid parameter cardholder.document.subtype',
    'message': 'Revisa tu documento'
  },
  '324': {
    'code': '324',
    'field': 'cardExpirationMonth',
    'reason': 'invalid parameter docNumber',
    'message': 'Revisa tu documento'
  },
  '326': {
    'code': '326',
    'field': 'cardExpirationYear',
    'reason': 'invalid parameter cardExpirationYear',
    'message': 'Revisa la fecha'
  },
  '106': {
    'code': '106',
    'reason': 'Cannot operate between users from different countries',
    'message': 'No puedes realizar pagos a usuarios de otros países'
  },
  '109': {
    'code': '109',
    'reason': 'Invalid number of shares for this payment_method_id',
    'message': 'El método de pago no procesa pagos en cuotas. Elige otra tarjeta u otro medio de pago'
  },
  '126': {
    'code': '126',
    'reason': 'The action requested is not valid for the current payment state',
    'message': 'No pudimos procesar tu pago'
  },
  '129': {
    'code': '129',
    'reason': 'Cannot pay this amount with this paymentMethod',
    'message': 'El método de pago no procesa pagos del monto seleccionado. Elige otra tarjeta u otro medio de pago'
  },
  '145': {
    'code': '145',
    'reason': 'Invalid users involved',
    'message': 'No pudimos procesar tu pago'
  },
  '150': {
    'code': '150',
    'reason': 'The payer_id cannot do payments currently',
    'message': 'No puedes realizar pagos'
  },
  '151': {
    'code': '151',
    'reason': 'The payer_id cannot do payments with this payment_method_id',
    'message': 'No puedes realizar pagos'
  },
  '160': {
    'code': '160',
    'reason': 'Collector not allowed to operate',
    'message': 'No pudimos procesar tu pago'
  },
  '204': {
    'code': '204',
    'reason': 'Unavailable payment_method',
    'message': 'El método de pago no está disponible en este momento. Elige otra tarjeta u otro medio de pago'
  },
  '801': {
    'code': '801',
    'reason': 'Already posted the same request in the last minute',
    'message': 'Realizaste un pago similar hace instantes. Intenta nuevamente en unos minutos'
  },
  '011': {
    'code': '011',
    'reason': 'Not valid action, the resource is in a state that does not allow this operation' +
      ' For more information see the state that has the resource.',
    'message': 'No se pudo actualizar el Token de tarjeta, ya que ha sido usado o expirado'
  }
};

