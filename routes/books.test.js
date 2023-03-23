const request = require('supertest');
const app = require('../app');
const Book = require('../models/book');

// Clear the database before each test
beforeEach(async () => {
 await Book.removeAll();
});

describe('GET /books', () => {
 it('should return a list of all books', async () => {
    const response = await request(app).get('/books');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('books');
    expect(response.body.books).toBeInstanceOf(Array);
    expect(response.body.books.length).toBe(0);
  });
});

describe('GET /books/:id', () => {
  it('should return a single book found by its id', async () => {
    const newBook = {
      isbn: '1234567890',
      'amazon-url': 'https://www.amazon.com/dp/1234567890',
      author: 'John Doe',
      language: 'English',
      pages: 250,
      publisher: 'Acme Publishing',
      title: 'The Ultimate Guide to Testing',
      year: 2023
      };
      const createdBook = await Book.create(newBook);
      const response = await request(app).get(`/books/${createdBook.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('book');
      expect(response.body.book).toMatchObject(newBook);
  });

  it('should return an error if the id is invalid', async () => {
    const response = await request(app).get('/books/invalid');
    expect(response.status).toBe(400);
  });

  it('should return an error if the book does not exist', async () => {
    const response = await request(app).get('/books/000000000000000000000000');
    expect(response.status).toBe(404);
  });
});

describe('POST /books', () => {
  it('should create a new book and respond with the newly created book', async () => {
    const newBook = {
      isbn: '1234567890',
      'amazon-url': 'https://www.amazon.com/dp/1234567890',
      author: 'John Doe',
      language: 'English',
      pages: 250,
      publisher: 'Acme Publishing',
      title: 'The Ultimate Guide to Testing',
      year: 2023
    };
    const response = await request(app)
      .post('/books')
      .send(newBook);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('book');
    expect(response.body.book).toMatchObject(newBook);
  });

  it('should return an error if the book is invalid', async () => {
    const invalidBook = {
      isbn: 'invalid',
      'amazon-url': 'not-a-url',
      author: 123,
      language: true,
      pages: 'not-a-number',
      publisher: {},
      title: null,
      year: 'not-a-number'
    };
    const response = await request(app)
      .post('/books')
      .send(invalidBook);
    expect(response.status).toBe(400);
  });
});

describe('PUT /books/:isbn', () => {
  it('should update a book and respond with the updated book', async () => {
   const book = await Book.create({
     isbn: '1234567890',
     'amazon-url': 'https://www.amazon.com/dp/1234567890',
     author: 'John Doe',
     language: 'English',
     pages: 250,
     publisher: 'Acme Publishing',
     title: 'The Ultimate Guide to Testing',
    year: 2023
    });

   const updatedBook = {
      isbn: '0987654321',
      'amazon-url': 'https://www.amazon.com/dp/0987654321',
      author: 'Jane Doe',
      language: 'Spanish',
      pages: 300,
      publisher: 'Acme Publishing',
      title: 'The Ultimate Guide to Testing 2.0',
      year: 2024
    }

    const response = await request(app)
      .put(`/books/${book.isbn}`)
      .send(updatedBook)
      .set('Accept', 'application/json')
    expect(response.status).toBe(200);
    expect(response.body.book).toBeInstanceOf(Object);
    expect(response.body.book.isbn).toBe(updatedBook.isb);
    const updatedBookInDb = await Book.findOne(book.id);
    expect(updatedBookInDb).toBeInstanceOf(Object);
    expect(updatedBookInDb.isbn).toBe(updatedBook.isbn);
    });

  it('should return an error if the isbn is invalid', async () => {
   const response = await request(app)
      .put('/books/invalid')
      .send({})
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });

  it('should return an error if the book is invalid', async () => {
    const book = await Book.create({
      isbn: '1234567890',
      'amazon-url': 'https://www.amazon.com/dp/1234567890',
      author: 'John Doe',
      language: 'English',
      pages: 250,
      publisher: 'Acme Publishing',
      title: 'The Ultimate Guide to Testing',
      year: 2023
    });

    const invalidBook = {
      isbn: 'invalid',
      'amazon-url': 'not-a-url',
      author: 123,
      language: true,
      pages: 'not-a-number',
      publisher: {},
      title: null,
      year: 'not-a-number'
    };

    const response = await request(app)
      .put(`/books/${book.isbn}`)
      .send(invalidBook)
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
  });

  it('should return an error if the book does not exist', async () => {
      const response = await request(app)
      .put('/books/0000000000')
      .send({})
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
  });
});