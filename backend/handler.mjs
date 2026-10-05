import { createHash, randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true }
});
const events = {
  0: { title: 'Golden Hour Sessions', price: '$28' },
  1: { title: 'The Sunday Market', price: 'Free' },
  2: { title: 'Clay After Dark', price: '$42' },
  3: { title: 'Rooftop Cinema Club', price: '$18' },
  4: { title: 'Run Club, No Club', price: 'Free' },
  5: { title: 'Jazz in the Courtyard', price: '$35' }
};
const origins = new Set((process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean));
const json = (statusCode, body, origin) => ({
  statusCode,
  headers: {
    'content-type': 'application/json',
    'access-control-allow-origin': origins.has(origin) ? origin : [...origins][0] || 'null',
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  },
  body: JSON.stringify(body)
});
const readBody = event => {
  try {
    return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : event.body || '{}');
  } catch {
    return null;
  }
};
const validEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const handler = async event => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  if (event.requestContext?.http?.method === 'OPTIONS') return json(204, {}, origin);
  const path = event.rawPath || event.path || '';
  const body = readBody(event);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { message: 'Please check your submission.' }, origin);
  if (typeof body.website === 'string' && body.website.trim()) return json(200, { ok: true }, origin);
  const now = new Date().toISOString();

  if (path.endsWith('/bookings')) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const eventId = Number(body.eventId);
    const quantity = Number(body.quantity);
    const selected = events[eventId];
    if (name.length < 2 || name.length > 100 || !validEmail(email) || !selected || !Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
      return json(400, { message: 'Enter a valid name, email, event, and ticket quantity.' }, origin);
    }
    const bookingId = randomUUID();
    try {
      await db.send(new PutCommand({
        TableName: process.env.BOOKINGS_TABLE,
        Item: { id: bookingId, name, email, eventId, eventTitle: selected.title, quantity, status: 'REQUESTED', createdAt: now },
        ConditionExpression: 'attribute_not_exists(id)'
      }));
      return json(201, { ok: true, requestId: bookingId }, origin);
    } catch (error) {
      console.error('booking_write_failed', error.name);
      return json(500, { message: 'Could not save your request. Please try again later.' }, origin);
    }
  }

  if (path.endsWith('/newsletter')) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!validEmail(email)) return json(400, { message: 'Enter a valid email address.' }, origin);
    const id = createHash('sha256').update(email).digest('hex');
    try {
      await db.send(new PutCommand({
        TableName: process.env.SUBSCRIBERS_TABLE,
        Item: { id, email, subscribedAt: now },
        ConditionExpression: 'attribute_not_exists(id)'
      }));
    } catch (error) {
      if (error.name !== 'ConditionalCheckFailedException') {
        console.error('newsletter_write_failed', error.name);
        return json(500, { message: 'Could not save your signup. Please try again later.' }, origin);
      }
    }
    return json(200, { ok: true }, origin);
  }

  return json(404, { message: 'Not found.' }, origin);
};
