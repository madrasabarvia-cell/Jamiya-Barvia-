import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PlusCircle, Trash2, Edit, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ManageVideos() {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    titleUrdu: '',
    url: '',
  });

  const loadVideos = async () => {
    try {
      const snap = await getDocs(collection(db, 'videos'));
      setVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      if (editVideo) {
        await updateDoc(doc(db, 'videos', editVideo.id), formData);
      } else {
        await addDoc(collection(db, 'videos'), { ...formData, createdAt: new Date().toISOString() });
      }
      setIsModalOpen(false);
      loadVideos();
    } catch (err) {
      console.error(err);
      alert('Error saving data');
    }
  };

  const openAddModal = () => {
    setEditVideo(null);
    setFormData({ title: '', titleUrdu: '', url: '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm(t('Are you sure you want to delete this video?', 'کیا آپ واقعی اس ویڈیو کو حذف کرنا چاہتے ہیں؟'))) {
      await deleteDoc(doc(db, 'videos', id));
      loadVideos();
    }
  };

  // Extract youtube video id
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
        <h2 className="text-2xl font-bold font-urdu text-emerald-900">{t('Manage Videos', 'ویڈیوز کا انتظام')}</h2>
        {isAdmin && (
          <button onClick={openAddModal} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse hover:bg-emerald-700">
            <PlusCircle className="w-5 h-5" />
            <span className="font-urdu">{t('Add Video', 'ویڈیو شامل کریں')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => {
          const videoId = getYouTubeId(video.url);
          return (
            <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              {videoId ? (
                <div className="aspect-video relative">
                  <iframe 
                    src={`https://www.youtube.com/embed/${videoId}`} 
                    className="absolute top-0 left-0 w-full h-full"
                    allowFullScreen 
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold font-urdu text-lg mb-1">{video.titleUrdu}</h3>
                <h4 className="text-sm font-sans text-gray-600" dir="ltr">{video.title}</h4>
                {isAdmin && (
                  <div className="flex justify-end space-x-3 space-x-reverse mt-4 border-t pt-3">
                    <button onClick={() => { setEditVideo(video); setFormData(video); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {videos.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 font-urdu border-2 border-dashed rounded-xl">
            {t('No videos found. Add educational videos here.', 'کوئی ویڈیو نہیں ملی۔ تعلیمی ویڈیوز یہاں شامل کریں۔')}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold font-urdu text-emerald-900 mb-6 border-b pb-2">
              {editVideo ? t('Edit Video', 'ویڈیو میں ترمیم کریں') : t('Add Video', 'ویڈیو شامل کریں')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Title (Urdu)', 'عنوان (اردو)')}</label>
                <input type="text" required className="w-full border rounded-lg px-3 py-2" value={formData.titleUrdu} onChange={e => setFormData({...formData, titleUrdu: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('Title (English)', 'عنوان (انگریزی)')}</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium font-urdu text-gray-700 mb-1">{t('YouTube URL', 'یوٹیوب یو آر ایل')}</label>
                <input type="url" required className="w-full border rounded-lg px-3 py-2 font-sans" dir="ltr" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1 font-urdu">{t('e.g. https://www.youtube.com/watch?v=...', 'مثلا https://www.youtube.com/watch?v=...')}</p>
              </div>
              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-urdu">{t('Cancel', 'منسوخ کریں')}</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-urdu">{t('Save', 'محفوظ کریں')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
