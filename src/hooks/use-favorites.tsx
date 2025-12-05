
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, serverTimestamp, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { useToast } from './use-toast';
import { Heart } from 'lucide-react';

type FavoriteContextType = {
  favorites: string[]; // Array of product IDs
  isLoading: boolean;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorited: (productId: string) => boolean;
};

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch favorites when user logs in
  useEffect(() => {
    if (!user || !firestore) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const favoritesRef = collection(firestore, 'users', user.uid, 'favorites');
    const unsubscribe = getDocs(favoritesRef)
      .then(snapshot => {
        const favIds = snapshot.docs.map(doc => doc.id);
        setFavorites(favIds);
      })
      .catch(error => {
        console.error('Error fetching favorites:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
      // onSnapshot could be used here for real-time updates
      // but getDocs is simpler for initial load.
      
  }, [user, firestore]);

  const addFavorite = useCallback(
    async (productId: string) => {
      if (!user || !firestore) return;
      try {
        const favRef = doc(firestore, 'users', user.uid, 'favorites', productId);
        await setDoc(favRef, {
          productId: productId,
          addedAt: serverTimestamp(),
        });
        setFavorites(prev => [...prev, productId]);
        toast({
          title: 'Added to Favorites!',
          icon: <Heart className="h-5 w-5 fill-primary text-primary" />,
        });
      } catch (error) {
        console.error('Error adding favorite:', error);
      }
    },
    [user, firestore, toast]
  );

  const removeFavorite = useCallback(
    async (productId: string) => {
      if (!user || !firestore) return;
      try {
        const favRef = doc(firestore, 'users', user.uid, 'favorites', productId);
        await deleteDoc(favRef);
        setFavorites(prev => prev.filter(id => id !== productId));
        toast({
          title: 'Removed from Favorites',
        });
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    },
    [user, firestore, toast]
  );

  const isFavorited = useCallback(
    (productId: string) => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      if (isFavorited(productId)) {
        removeFavorite(productId);
      } else {
        addFavorite(productId);
      }
    },
    [isFavorited, addFavorite, removeFavorite]
  );

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        isLoading,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorited,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};
