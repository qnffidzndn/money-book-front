import { useEffect, useState } from 'react';
import { getMembers } from '../api/member';

export default function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMembers()
      .then((res) => setMembers(res.data?.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { members, loading, error };
}
