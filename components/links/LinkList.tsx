import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Link as MuiLink,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { Link } from '@/lib/types/board';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface LinkListProps {
  links: Link[];
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
}

export function LinkList({ links, onEdit, onDelete }: LinkListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedLink, setSelectedLink] = React.useState<Link | null>(null);

  const handleDeleteClick = (link: Link) => {
    setSelectedLink(link);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedLink) {
      onDelete(selectedLink);
      setDeleteDialogOpen(false);
      setSelectedLink(null);
    }
  };

  return (
    <Box>
      <List>
        {links.map((link) => (
          <Paper key={link.id} sx={{ mb: 2 }}>
            <ListItem
              secondaryAction={
                <Box>
                  <IconButton onClick={() => onEdit(link)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(link)}>
                    <DeleteIcon />
                  </IconButton>
                  <Tooltip title="새 탭에서 열기">
                    <IconButton
                      component="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LaunchIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{link.site_name}</Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <MuiLink
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {link.url}
                    </MuiLink>
                    <Typography variant="caption" color="text.secondary">
                      등록일: {format(new Date(link.created_at), 'PPP', { locale: ko })}
                      {link.updated_at && link.updated_at !== link.created_at && (
                        <> | 수정일: {format(new Date(link.updated_at), 'PPP', { locale: ko })}</>
                      )}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>링크 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말 이 링크를 삭제하시겠습니까?</Typography>
          <Typography variant="caption" color="error">
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
