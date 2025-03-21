'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Icon from '@/components/common/Icon';
import { Filters } from './Filters';
import { Statistics } from './Statistics';
import { WordsTable } from '../words-table/WordsTable';
import { WordsPagination } from '../words-table/WordsPagination';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchWords as fetchDictionaryWords,
  fetchStatistics,
  addWordToDictionary,
  createWord,
  editWord,
} from '@/redux/features/dictionary/operations';
import { fetchWords as fetchRecommendWords } from '@/redux/features/recommend/operations';
import { selectWords } from '@/redux/features/dictionary/selectors';
import { selectRecommendWords } from '@/redux/features/recommend/selectors';
import {
  selectDictionaryStatus,
  selectCategories as selectDictionaryCategories,
} from '@/redux/features/dictionary/selectors';
import { selectRecommendStatus } from '@/redux/features/recommend/selectors';
import { showSuccess } from '@/lib/utils/toast';
import { AddWordModal } from '../words-table/AddWordModal';
import { EditWordModal } from '../words-table/EditWordModal';
import {
  WordCategory,
  AddWordFormData,
  EditWordFormData,
  WordResponse,
} from '@/lib/types/dictionary';
import { useSearchParams } from 'next/navigation';

interface DashboardProps {
  variant: 'dictionary' | 'recommend';
}

export function Dashboard({ variant }: DashboardProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const [addingWordIds, setAddingWordIds] = useState<string[]>([]);
  const dictionaryWords = useAppSelector(selectWords);
  const recommendWords = useAppSelector(selectRecommendWords);
  const dictionaryStatus = useAppSelector(selectDictionaryStatus);
  const recommendStatus = useAppSelector(selectRecommendStatus);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(
    searchParams.get('openAddWord') === 'true'
  );
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const categories = useAppSelector(selectDictionaryCategories);

  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    word: WordResponse | null;
  }>({
    isOpen: false,
    word: null,
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    if (variant === 'dictionary') {
      dispatch(fetchDictionaryWords());
    } else {
      dispatch(fetchRecommendWords());
    }
    dispatch(fetchStatistics());
  }, [dispatch, variant]);

  useEffect(() => {
    setIsAddWordModalOpen(searchParams.get('openAddWord') === 'true');
  }, [searchParams]);

  const isLoading =
    variant === 'dictionary'
      ? dictionaryStatus === 'loading'
      : recommendStatus === 'loading';

  const words =
    variant === 'dictionary' ? dictionaryWords.results : recommendWords.results;

  const handleAddWord = (wordId: string) => {
    setAddingWordIds((prev) => [...prev, wordId]);

    dispatch(addWordToDictionary(wordId))
      .then((result) => {
        if (addWordToDictionary.fulfilled.match(result)) {
          showSuccess('Word added to dictionary successfully');
        }
      })
      .finally(() => {
        setAddingWordIds((prev) => prev.filter((id) => id !== wordId));
      });
  };

  const handleAddNewWord = (data: AddWordFormData) => {
    setIsAddSubmitting(true);

    dispatch(
      createWord({
        en: data.en,
        ua: data.ua,
        category: data.category as WordCategory,
        isIrregular: data.isIrregular,
      })
    )
      .then((result) => {
        if (createWord.fulfilled.match(result)) {
          showSuccess('Word added successfully');
          setIsAddWordModalOpen(false);
          dispatch(fetchDictionaryWords());
          dispatch(fetchStatistics());
        }
      })
      .finally(() => {
        setIsAddSubmitting(false);
      });
  };

  const handleEditWord = async (data: EditWordFormData) => {
    if (!editModalState.word) return;

    setIsEditSubmitting(true);

    try {
      const result = await dispatch(
        editWord({
          wordId: editModalState.word._id,
          wordData: {
            en: data.en,
            ua: data.ua,
            category: data.category as WordCategory,
            isIrregular: data.isIrregular,
          },
        })
      );

      if (editWord.fulfilled.match(result)) {
        showSuccess('Word successfully updated');
        setEditModalState({ isOpen: false, word: null });
        dispatch(fetchDictionaryWords());
      }
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCloseAddModal = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('openAddWord');
    window.history.replaceState({}, '', url);
    setIsAddWordModalOpen(false);
  };

  const handleOpenEditModal = (word: WordResponse) => {
    setEditModalState({ isOpen: true, word });
  };

  const handleCloseEditModal = () => {
    setEditModalState({ isOpen: false, word: null });
  };

  const renderWordsTable = () => {
    if (variant === 'dictionary') {
      return (
        <WordsTable
          variant="dictionary"
          words={words}
          isLoading={isLoading}
          onEditWord={handleOpenEditModal}
        />
      );
    }
    return (
      <WordsTable
        variant="recommend"
        words={words}
        isLoading={isLoading}
        onWordAdd={handleAddWord}
        addingWordIds={addingWordIds}
      />
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-10 md:gap-7 lg:flex-row lg:items-center lg:justify-between">
        <Filters variant={variant} />

        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <div className="w-full md:w-auto">
            <Statistics />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {variant === 'dictionary' && (
              <Button
                variant="ghost"
                onClick={() => setIsAddWordModalOpen(true)}
                className="p-1 font-primary text-base font-medium group"
              >
                Add word
                <Icon
                  id="#plus"
                  className="mb-1 ml-2 h-5 w-5 stroke-brand-primary fill-none transition-transform duration-200 group-hover:scale-125"
                  aria-hidden="true"
                />
              </Button>
            )}

            <Button
              variant="ghost"
              asChild
              className="p-1 font-primary text-base font-medium group"
            >
              <Link href="/training">
                Train oneself
                <Icon
                  id="#arrow-right"
                  className="mb-1 ml-2 h-5 w-5 stroke-brand-primary fill-none transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-7">
        {renderWordsTable()}
        <WordsPagination className="mt-8 md:mt-7" variant={variant} />
      </div>

      {variant === 'dictionary' && (
        <>
          <AddWordModal
            categories={categories}
            isOpen={isAddWordModalOpen}
            onOpenChange={handleCloseAddModal}
            onSubmit={handleAddNewWord}
            isSubmitting={isAddSubmitting}
          />

          <EditWordModal
            word={editModalState.word}
            categories={categories}
            isOpen={editModalState.isOpen}
            onOpenChange={handleCloseEditModal}
            onSubmit={handleEditWord}
            isSubmitting={isEditSubmitting}
          />
        </>
      )}
    </div>
  );
}
