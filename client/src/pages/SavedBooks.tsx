import { useMutation, useQuery } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { GET_ME } from '../utils/queries'; // Import the GET_ME query
import { REMOVE_BOOK } from '../utils/mutations'; // Import the REMOVE_BOOK mutation
import Auth from '../utils/auth';

const SavedBooks = () => {
  // Fetch user data using the GET_ME query
  const { loading, data, refetch } = useQuery(GET_ME);

  // Mutation for removing a saved book
  const [removeBook] = useMutation(REMOVE_BOOK);

  // Destructure user data from the query response
  const userData = data?.me || { savedBooks: [] };

  // Create function to handle deleting a book
  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },
      });

      if (!data) {
        throw new Error('Something went wrong!');
      }

      // Refetch user data to update the UI
      refetch();

      console.log(`Book with ID ${bookId} removed.`);
    } catch (err) {
      console.error(err);
    }
  };

  // If data is still loading, display a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;

