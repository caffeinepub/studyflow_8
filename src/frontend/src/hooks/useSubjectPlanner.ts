import {
  useAddSubject,
  useAddTopics,
  useDeleteSubject,
  useDeleteTopic,
  useGetSubjects,
  useGetTopics,
  useToggleTopic,
} from "./useQueries";

export type Topic = {
  id: string;
  subjectId: string;
  text: string;
  completed: boolean;
  createdAt: bigint;
};

export type Subject = {
  id: string;
  name: string;
  createdAt: bigint;
};

export function useSubjectPlanner() {
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjects();
  const { data: topics = [], isLoading: topicsLoading } = useGetTopics();

  const { mutate: addSubjectMutation } = useAddSubject();
  const { mutate: deleteSubjectMutation } = useDeleteSubject();
  const { mutate: addTopicsMutation } = useAddTopics();
  const { mutate: toggleTopicMutation } = useToggleTopic();
  const { mutate: deleteTopicMutation } = useDeleteTopic();

  const addSubject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addSubjectMutation(trimmed);
  };

  const deleteSubject = (id: string) => {
    deleteSubjectMutation(id);
  };

  const addTopics = (subjectId: string, texts: string[]) => {
    const filtered = texts.map((t) => t.trim()).filter(Boolean);
    if (filtered.length === 0) return;
    addTopicsMutation({ subjectId, texts: filtered });
  };

  const toggleTopic = (id: string) => {
    toggleTopicMutation(id);
  };

  const deleteTopic = (id: string) => {
    deleteTopicMutation(id);
  };

  return {
    subjects,
    topics,
    addSubject,
    deleteSubject,
    addTopics,
    toggleTopic,
    deleteTopic,
    isLoading: subjectsLoading || topicsLoading,
  };
}
