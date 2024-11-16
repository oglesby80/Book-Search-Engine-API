import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
} from 'react-bootstrap';

import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations'; // Import the GraphQL mutation
import Auth from '../utils/auth';
import type { Book } from '../models/Book';
import type { GoogleAPIBook } from '../models/GoogleAPIBook';

const SearchBooks = () => {
  // State for holding returned Google API data
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState('');

  // Mutation for saving a book
  const [saveBook] = useMutation(SAVE_BOOK);

  // Create method to search for books and set state on form submit
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // Create function to handle saving a book to the database
  const handleSaveBook = async (bookId: string) => {
    const bookToSave: Book = searchedBooks.find((book) => book.bookId === bookId)!;

    if (!Auth.loggedIn()) {
      return false;
    }

    try {
      const { data } = await saveBook({
        variables: { book: bookToSave },
      });

      if (!data) {
        throw new Error('Something went wrong!');
      }

      console.log('Book saved:', data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {
                  "compilerOptions": {
                    "jsx": "react"
                  }
                }
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={searchedBooks.some(
                        (savedBook) => savedBook.bookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {searchedBooks.some(
                        (savedBook) => savedBook.bookId === book.bookId
                      )
                        ? 'This book has already been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
