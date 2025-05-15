import React from 'react';
import { Layout } from '@/components/layout';
import { LinkList } from '@/components/links/LinkList';
import { LinkForm } from '@/components/links/LinkForm';
import { useLinks } from '@/lib/hooks/useLinks';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Link } from '@/lib/types/board';

export default function LinksPage() {
  const {
    links,
    isLoadingLinks,
    createLink,
    updateLink,
    deleteLink,
  } = useLinks();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingLink, setEditingLink] = React.useState<Link | null>(null);

  const handleCreate = async (data: any) => {
    await createLink(data);
    setFormOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (editingLink) {
      await updateLink({ ...data, id: editingLink.id });
      setEditingLink(null);
      setFormOpen(false);
    }
  };

  const handleEdit = (link: Link) => {
    setEditingLink(link);
    setFormOpen(true);
  };

  const handleDelete = async (link: Link) => {
    await deleteLink(link.id);
  };

  const handleCloseForm = () => {
    setEditingLink(null);
    setFormOpen(false);
  };

  if (isLoadingLinks) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4">링크 관리</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            새 링크 추가
          </Button>
        </Box>

        <LinkList
          links={links}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog
          open={formOpen}
          onClose={handleCloseForm}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingLink ? '링크 수정' : '새 링크 추가'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <LinkForm
                initialData={editingLink || undefined}
                onSubmit={editingLink ? handleUpdate : handleCreate}
                onCancel={handleCloseForm}
              />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
}
