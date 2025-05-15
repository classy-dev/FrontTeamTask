import { useState } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Layout } from '@/components/layout';
import { Category } from '@/lib/types/goal';

export default function CategoriesPage() {
  const {
    categories,
    isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = async (data: { name: string }) => {
    await createCategory(data);
    setIsDialogOpen(false);
  };

  const handleEdit = async (data: { name: string }) => {
    if (editingCategory) {
      await updateCategory({ id: editingCategory.id, ...data });
      setEditingCategory(null);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (isDeleting) return;
    if (window.confirm('이 카테고리를 삭제하시겠습니까? 관련된 목표들의 카테고리가 삭제됩니다.')) {
      await deleteCategory(id);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">카테고리 관리</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            카테고리 추가
          </Button>
        </Box>

        <CategoryList
          categories={categories}
          isLoading={isLoadingCategories}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />

        <Dialog
          open={isDialogOpen}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingCategory ? '카테고리 수정' : '카테고리 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <CategoryForm
                initialData={editingCategory || undefined}
                onSubmit={editingCategory ? handleEdit : handleCreate}
                isSubmitting={editingCategory ? isUpdating : isCreating}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
}
