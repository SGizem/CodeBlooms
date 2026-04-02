const Order = require('../models/Order');

exports.addNote = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Not mesajı gerekli." });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });

    // Kullanıcı doğrulaması (Sadece kendi siparişine not ekleyebilir)
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    order.notes.push({ message });
    await order.save();

    res.status(201).json({ message: "Not eklendi", order });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { orderId, noteId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" });
    
    // Kullanıcı doğrulaması (Sadece kendi siparişindeki notu silebilir)
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
       return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    order.notes = order.notes.filter(
      (note) => note._id.toString() !== noteId
    );
    
    await order.save();
    res.status(200).json({ message: "Not silindi", order });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};
