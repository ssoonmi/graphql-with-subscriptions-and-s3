import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { CREATE_POST } from '../../graphql/posts';

export default () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [createPost, { loading, error }] = useMutation(
    CREATE_POST,
    {
      variables: {
        input: {
          title,
          description,
          photo
        }
      },
      onError(e) {
        console.log(e);
      },
      onCompleted() {
        setTitle('');
        setDescription('');

      }
    }
  );


  return (
    <form onSubmit={e => {
      e.preventDefault();
      createPost();
    }}>
      <label>
        Title
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <label>
        Photo
        <input type="file" onChange={(e) => e.target.validity.valid && setPhoto(e.target.files[0])} />
      </label>
      <input type="submit" value="Create Post" disabled={loading} />
    </form>
  )
}